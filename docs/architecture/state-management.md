# State Management

### Request State Machine

```
Draft → Submitted → Screening → [Pending Info | Compliance Review] → Approved/Rejected → Settling → Completed
```

**التحولات المسموحة:**
- Draft → Submitted (المستثمر)
- Submitted → Screening (تلقائي)
- Screening → Pending Info (الأدمن)
- Screening → Compliance Review (الأدمن)
- Screening → Approved/Rejected (الأدمن)
- Pending Info → Screening (المستثمر يرد)
- Compliance Review → Approved/Rejected (الأدمن)
- Approved → Settling (الأدمن)
- Settling → Completed (الأدمن)

