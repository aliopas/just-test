# معايير البرمجة
## Coding Standards

**الإصدار:** 1.0  
**التاريخ:** 2024-11-06

---

## General Principles

1. **Code Clarity:** الكود يجب أن يكون واضحاً وسهل القراءة
2. **Consistency:** استخدام نفس الأنماط في جميع أنحاء المشروع
3. **DRY (Don't Repeat Yourself):** تجنب التكرار
4. **SOLID Principles:** اتباع مبادئ SOLID
5. **Security First:** الأمان أولوية في جميع القرارات

---

## TypeScript Standards

### Type Definitions

- استخدام TypeScript بشكل صارم (`strict: true`)
- تعريف Types/Interfaces لجميع البيانات
- تجنب `any` - استخدام `unknown` إذا لزم
- استخدام Type Guards للتحقق من Types

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ Bad
const user: any = { id: 1, email: 'test@example.com' };
```

### Naming Conventions

- **Variables & Functions:** camelCase
- **Classes & Interfaces:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** kebab-case (للـ components) أو camelCase (للـ utilities)

```typescript
// ✅ Good
const userName = 'John';
function getUserById(id: string) {}
class UserService {}
const MAX_RETRIES = 3;

// ❌ Bad
const user_name = 'John';
function GetUserById(id: string) {}
```

### File Organization

- ملف واحد لكل Class/Component
- Export واحد رئيسي لكل ملف
- استخدام Barrel Exports (`index.ts`) للمجلدات

---

## React/Next.js Standards

### Component Structure

```typescript
// ✅ Good Component Structure
import { useState } from 'react';
import type { FC } from 'react';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const MyComponent: FC<Props> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{title}</h1>
      {/* ... */}
    </div>
  );
};
```

### Hooks

- استخدام Custom Hooks للمنطق المعقد
- تسمية Hooks بـ `use` prefix
- تجنب Hooks داخل Loops أو Conditions

```typescript
// ✅ Good
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, loading, error };
};

// ❌ Bad
if (condition) {
  const [user, setUser] = useState(null); // Wrong!
}
```

### State Management

- استخدام `useState` للـ Local State
- استخدام Context للـ Global State البسيط
- استخدام Zustand للـ Complex State

---

## Backend/Express Standards

### Route Structure

```typescript
// ✅ Good Route Structure
import { Router } from 'express';
import { validateRequest } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { RequestController } from '../controllers/request.controller';

const router = Router();

router.get(
  '/',
  authMiddleware,
  validateRequest(getRequestsSchema),
  RequestController.getAll
);

export default router;
```

### Error Handling

```typescript
// ✅ Good Error Handling
try {
  const result = await service.doSomething();
  return res.json({ data: result });
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  logger.error('Unexpected error', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

### Async/Await

- استخدام async/await بدلاً من Promises chains
- معالجة الأخطاء بشكل صحيح

```typescript
// ✅ Good
const getUser = async (id: string): Promise<User> => {
  const user = await db.users.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

// ❌ Bad
const getUser = (id: string) => {
  return db.users.findById(id).then(user => {
    if (!user) throw new Error('Not found');
    return user;
  });
};
```

---

## Database Standards

### Supabase Queries

- استخدام Supabase Client للاستعلامات
- استخدام Parameterized Queries دائماً
- تجنب Raw SQL إلا عند الضرورة

```typescript
// ✅ Good
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// ❌ Bad
const query = `SELECT * FROM requests WHERE user_id = '${userId}'`;
```

### Migrations

- استخدام Supabase Migrations
- تسمية Migrations بشكل وصفي: `YYYYMMDDHHMMSS_description.sql`
- كل Migration يجب أن يكون Reversible

---

## Security Standards

### Authentication

- التحقق من Authentication في كل Protected Route
- استخدام Supabase Auth Middleware
- التحقق من JWT Token في كل Request

### Authorization

- التحقق من الصلاحيات قبل كل Action
- استخدام RBAC بشكل صارم
- تسجيل جميع الإجراءات الحساسة في Audit Log

### Input Validation

- التحقق من جميع المدخلات باستخدام Zod
- Sanitize المدخلات قبل المعالجة
- Reject أي Input غير صالح

```typescript
// ✅ Good
import { z } from 'zod';

const createRequestSchema = z.object({
  type: z.enum(['buy', 'sell']),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

const validated = createRequestSchema.parse(req.body);
```

### Secrets Management

- عدم Commit Secrets في الكود
- استخدام Environment Variables
- استخدام Supabase Secrets Management

---

## Testing Standards

### Unit Tests

- كتابة Tests لجميع Functions المعقدة
- استخدام Descriptive Test Names
- اتباع AAA Pattern (Arrange, Act, Assert)

```typescript
// ✅ Good Test
describe('RequestService', () => {
  it('should create a request with valid data', async () => {
    // Arrange
    const requestData = {
      type: 'buy',
      amount: 1000,
      currency: 'SAR',
    };

    // Act
    const result = await requestService.create(requestData);

    // Assert
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('draft');
  });
});
```

### Integration Tests

- Test API Endpoints بشكل كامل
- استخدام Test Database
- تنظيف Test Data بعد كل Test

---

## Code Review Standards

### Checklist

- [ ] الكود يتبع معايير المشروع
- [ ] جميع Tests تمر بنجاح
- [ ] لا توجد Console.logs أو Debug Code
- [ ] Error Handling مناسب
- [ ] Security Considerations تم أخذها في الاعتبار
- [ ] Documentation محدثة
- [ ] Performance Considerations تم أخذها في الاعتبار

---

## Documentation Standards

### Code Comments

- استخدام Comments لشرح الـ "Why" وليس الـ "What"
- Document Complex Logic
- استخدام JSDoc للـ Functions العامة

```typescript
/**
 * Creates a new investment request
 * @param userId - The ID of the user creating the request
 * @param requestData - The request data (type, amount, currency)
 * @returns The created request with generated request number
 * @throws ValidationError if data is invalid
 */
async function createRequest(
  userId: string,
  requestData: CreateRequestDto
): Promise<Request> {
  // Implementation
}
```

---

## Git Standards

### Commit Messages

- استخدام Conventional Commits format
- رسائل واضحة ووصفية

```
feat: add request creation endpoint
fix: resolve authentication issue
docs: update API documentation
refactor: improve error handling
test: add unit tests for request service
```

### Branch Naming

- `feature/description` - للميزات الجديدة
- `fix/description` - للإصلاحات
- `refactor/description` - لإعادة الهيكلة
- `docs/description` - للتوثيق

---

## Performance Standards

### Frontend

- استخدام Code Splitting
- Lazy Loading للـ Components الكبيرة
- Optimize Images
- Minimize Bundle Size

### Backend

- استخدام Database Indexes
- Optimize Queries
- Implement Caching حيث مناسب
- Monitor Performance Metrics

---

## Accessibility Standards

- استخدام Semantic HTML
- ARIA Labels حيث لزم
- Keyboard Navigation Support
- Screen Reader Compatibility
- WCAG AA Compliance

---

## Internationalization (i18n)

- استخدام next-intl للترجمة
- فصل جميع النصوص إلى Translation Files
- دعم RTL للعربية
- استخدام Date/Number Formatting المناسب

```typescript
// ✅ Good
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
<h1>{t('welcome')}</h1>

// ❌ Bad
<h1>Welcome</h1>
```

