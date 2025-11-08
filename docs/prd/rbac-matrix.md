# RBAC Matrix

يوضح هذا المستند العلاقة بين الأدوار (Roles) والصلاحيات (Permissions) وفقًا لمتطلبات Story 2.1.

## الأدوار الافتراضية

- `investor` — مستثمر يمكنه إدارة ملفه الشخصي والطلبات المرتبطة به.
- `admin` — أدمن النظام مع القدرة على إدارة المستخدمين، الطلبات، والمحتوى.

## الصلاحيات

| الصلاحية (`slug`)             | الاسم                | الوصف                                                        | الفئة        |
|-------------------------------|----------------------|--------------------------------------------------------------|-------------|
| `investor.profile.read`       | قراءة الملف الشخصي   | يسمح للمستثمر بقراءة ملفه الشخصي                             | investor    |
| `investor.profile.update`     | تحديث الملف الشخصي   | يسمح للمستثمر بتحديث ملفه الشخصي وبيانات KYC                 | investor    |
| `investor.requests.create`    | إنشاء طلب            | يسمح بإنشاء طلب استثماري جديد                               | investor    |
| `investor.requests.read`      | عرض الطلبات          | يسمح بعرض الطلبات الاستثمارية للمستثمر                       | investor    |
| `investor.requests.update`    | تعديل الطلبات        | يسمح بتعديل الطلب قبل إرساله                                | investor    |
| `investor.requests.submit`    | إرسال الطلب          | يسمح بإرسال الطلب للمراجعة                                  | investor    |
| `investor.notifications.read` | قراءة الإشعارات      | يسمح بعرض مركز الإشعارات                                     | investor    |
| `admin.users.manage`          | إدارة المستخدمين      | يسمح بإدارة المستخدمين، حالاتهم، وأدوارهم                    | admin       |
| `admin.roles.manage`          | إدارة الأدوار        | يسمح بإدارة الأدوار والصلاحيات                               | admin       |
| `admin.audit.read`            | عرض سجل التدقيق      | يسمح بعرض سجلات التدقيق                                     | admin       |
| `admin.requests.review`       | مراجعة الطلبات       | يسمح بمراجعة ومعالجة الطلبات الاستثمارية                     | admin       |
| `admin.content.manage`        | إدارة المحتوى        | يسمح بإدارة الأخبار والمحتوى                                 | admin       |
| `system.health.read`          | فحص صحة النظام       | صلاحية للأنظمة المراقبة لقراءة مؤشرات الصحة                 | system      |

## مصفوفة الأدوار والصلاحيات

| Role / Permission             | investor | admin |
|-------------------------------|:--------:|:-----:|
| `investor.profile.read`       |    ✅     |  ✅   |
| `investor.profile.update`     |    ✅     |  ✅   |
| `investor.requests.create`    |    ✅     |  ✅   |
| `investor.requests.read`      |    ✅     |  ✅   |
| `investor.requests.update`    |    ✅     |  ✅   |
| `investor.requests.submit`    |    ✅     |  ✅   |
| `investor.notifications.read` |    ✅     |  ✅   |
| `admin.users.manage`          |    ❌     |  ✅   |
| `admin.roles.manage`          |    ❌     |  ✅   |
| `admin.audit.read`            |    ❌     |  ✅   |
| `admin.requests.review`       |    ❌     |  ✅   |
| `admin.content.manage`        |    ❌     |  ✅   |
| `system.health.read`          |    ❌     |  ✅   |

> ملاحظة: يحصل الأدمن على جميع الصلاحيات لأي دور ولا يتأثر بقيود `grant_type = deny` المخصصة للأدوار الأخرى.

