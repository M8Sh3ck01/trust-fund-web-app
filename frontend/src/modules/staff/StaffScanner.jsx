import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { Search, Loader2, CheckCircle2, AlertCircle, RefreshCcw, Camera, CameraOff } from 'lucide-react';
import apiClient from '../../api/client';
import styles from './StaffScanner.module.css';

export default function StaffScanner() {
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [hasCamera, setHasCamera] = useState(true);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Start scanner when camera is active and we have a result cleared
  useEffect(() => {
    if (!cameraActive || !videoRef.current || result) return;

    // Check device has a camera first
    QrScanner.hasCamera().then(has => {
      if (!has) {
        setHasCamera(false);
        setCameraActive(false);
        return;
      }

      const scanner = new QrScanner(
        videoRef.current,
        (scanResult) => {
          scanner.stop();
          handleVerification(scanResult.data);
        },
        {
          preferredCamera: 'environment',  // Use back camera by default
          highlightScanRegion: true,       // Show scan frame overlay
          highlightCodeOutline: true,      // Highlight detected QR
          maxScansPerSecond: 5,
        }
      );

      scannerRef.current = scanner;

      const tryStart = (attempt = 1) => {
        scanner.start().catch((err) => {
          const isPermissionDenied =
            err?.name === 'NotAllowedError' ||
            String(err).includes('Permission') ||
            String(err).includes('denied');

          if (isPermissionDenied) {
            // Actual permission block — tell the user
            setError('📷 Camera blocked. Grant camera access in your browser settings, or use manual entry below.');
            setCameraActive(false);
          } else if (attempt < 3) {
            // Transient error (camera busy, timing) — retry silently
            setTimeout(() => tryStart(attempt + 1), 600);
          } else {
            // Exhausted retries but not a permission issue — hide camera quietly
            setCameraActive(false);
          }
        });
      };

      tryStart();
    });

    return () => {
      scannerRef.current?.stop();
      scannerRef.current = null;
    };
  }, [cameraActive, result]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) handleVerification(manualCode.trim());
  };

  const handleVerification = async (code) => {
    setIsVerifying(true);
    setError(null);

    try {
      // QR format: "ORDER-{id}:{token}" or "BOOKING-{id}:{token}"
      // Manual entry format: "ORDER-{id}" (no token)
      const dashIndex = code.indexOf('-');
      if (dashIndex === -1) throw new Error('Invalid code format');

      const type = code.substring(0, dashIndex);          // "ORDER" or "BOOKING"
      const rest = code.substring(dashIndex + 1);         // "{id}:{token}" or "{id}"

      const colonIndex = rest.indexOf(':');
      const id    = colonIndex !== -1 ? rest.substring(0, colonIndex) : rest;
      const token = colonIndex !== -1 ? rest.substring(colonIndex + 1) : null;

      let endpoint = '';
      if (type === 'ORDER') endpoint = `/api/orders/${id}/collect`;
      else if (type === 'BOOKING') endpoint = `/api/bookings/${id}/collect`;
      else throw new Error('Invalid code. Expected ORDER-... or BOOKING-...');

      const payload = token ? { token } : { staffVerified: true };
      const response = await apiClient.patch(endpoint, payload);

      setResult({
        type,
        message: response.message || 'Successfully Collected',
        data: response.order || response.booking,
      });
      setManualCode('');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Verification Failed';
      // Remap raw backend errors into staff-friendly messages
      const friendlyMsg = 
        msg.includes('not found')             ? '❌ Not found — check the code and try again.' :
        msg.includes('already been collected')? '✅ Already collected — this ticket was used.' :
        msg.includes('Invalid collection token') ? '🚫 Invalid QR — ask customer to reopen their ticket.' :
        msg.includes('Invalid code')           ? '⚠️ Unrecognised format — scan again or type ORDER-XXXXX.' :
        msg;
      setError(friendlyMsg);
      // Restart scanner on failure so staff can try again
      scannerRef.current?.start();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setManualCode('');
    setCameraActive(true);
  };

  return (
    <div className={styles.container}>
      {result ? (
        /* ── Success State ── */
        <div className={styles.resultView}>
          <div className={styles.successIcon}><CheckCircle2 size={72} /></div>
          <h2 className={styles.successTitle}>Collection Confirmed</h2>
          <p className={styles.resultMsg}>{result.message}</p>
          <div className={styles.resultDetails}>
            <span className={styles.resultType}>{result.type} Redemption</span>
            <span className={styles.resultId}>#{result.data?._id?.slice(-6).toUpperCase()}</span>
          </div>
          <button className={styles.resetBtn} onClick={handleReset}>
            <RefreshCcw size={18} /> Next Customer
          </button>
        </div>
      ) : (
        <>
          {/* ── Camera Viewfinder ── */}
          <div className={styles.scannerBox}>
            {cameraActive && hasCamera ? (
              <>
                <video ref={videoRef} className={styles.video} />
                <p className={styles.hint}>Align QR code within the frame</p>
                <button className={styles.toggleCamera} onClick={() => setCameraActive(false)}>
                  <CameraOff size={14} /> Hide Camera
                </button>
              </>
            ) : (
              <div className={styles.noCamera}>
                {hasCamera ? (
                  <button className={styles.activateCamera} onClick={() => setCameraActive(true)}>
                    <Camera size={20} /> Tap to Activate Camera
                  </button>
                ) : (
                  <p className={styles.hint}>No camera detected on this device</p>
                )}
              </div>
            )}
          </div>

          {/* ── Error / Status Banner — right below scanner ── */}
          {error && (
            <div className={`${styles.errorBox} ${error.startsWith('✅') ? styles.infoBox : ''}`}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Divider ── */}
          <div className={styles.divider}><span>OR ENTER MANUALLY</span></div>

          {/* ── Manual Code Entry ── */}
          <form className={styles.manualForm} onSubmit={handleManualSubmit}>
            <div className={styles.inputWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="ORDER-XXXXX or BOOKING-XXXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                disabled={isVerifying}
                autoComplete="off"
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={!manualCode.trim() || isVerifying}>
              {isVerifying ? <Loader2 className={styles.spin} size={18} /> : 'Verify Code'}
            </button>
          </form>

        </>
      )}
    </div>
  );
}
