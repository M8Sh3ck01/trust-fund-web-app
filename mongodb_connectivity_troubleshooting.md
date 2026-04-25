# MongoDB Atlas Connectivity Troubleshooting Reference

This document serves as a permanent reference detailing the sequence of connection errors encountered while integrating MongoDB Atlas with Node.js on a restrictive local network, and the architectural solutions applied to bypass them safely.

## 1. `querySrv ECONNREFUSED`
When using the standard `mongodb+srv://` Atlas connection string, Node.js throws `querySrv ECONNREFUSED _mongodb._tcp.cluster...`.

> [!CAUTION]
> **Root Cause:** A restrictive ISP, local VPN, or Windows dual-stack misconfiguration actively dropping advanced DNS packet requests (like `SRV` and `TXT` queries) made by Node's internal `c-ares` DNS resolver.

**Attempted Fixes:**
- Overriding Node's DNS by injecting `dns.setServers(['8.8.8.8'])`. *(Result: Caused a secondary timeout if port 53 outbound was also dropped by the network).*
- Resolving the `SRV` payload externally via PowerShell's `Resolve-DnsName`, which bypassed the Node environment restrictions.

## 2. `Server selection timed out after 5000 ms`
After bypassing the `SRV` rejection, Mongoose hung dynamically when attempting to hit the cluster nodes.

> [!NOTE]
> **Root Cause 1: IPv6 Blackholes (Node 18+)**
> Node.js 18+ natively prefers IPv6 DNS resolution. If your Local Area Network doesn't properly support IPv6 routes, Node routes the database traffic into a silent void, triggering a severe 5000ms delay.
> **Solution:** Force Mongoose to restrict queries sequentially to IPv4 by passing `{ family: 4 }` into your connection options:
> ```javascript
> mongoose.connect(uri, { family: 4 })
> ```

> [!NOTE]
> **Root Cause 2: Unresolvable Replica Set Syncing**
> Free tier MongoDB Atlas nodes (`M0`) validate connections via highly specific Replica Set verifications (e.g., `replicaSet=atlas-wcskyiz-shard-0`). If internal Node.js packet timeouts happen during discovery mode, Mongoose cancels the server selection natively.
> **Solution:** Circumvent discovery requirements and link directly to a single TCP shard using the `directConnection=true` flag.

## The Ultimate Solution Applied
Because of the heavy, compounding network routing traps occurring across standard Node setups, we opted out of `+srv` entirely, connecting statically via `directConnection`.

1. **Replaced the `+srv` URI** in `.env` with a hardcoded, explicitly bound connection string verified via successful TCP diagnostic pings.
2. **Appended `directConnection=true`** ensuring Node acts as a standalone client pushing data straight to the primary Node without invoking the overarching cluster network map validation.

```env
# Example bypass connection string guaranteeing instant connectivity
MONGO_URI="mongodb://username:password@ac-wcskyiz-shard-00-00.s5wzjpy.mongodb.net:27017/backend_core_dev?ssl=true&authSource=admin&directConnection=true"
```
