# Testing Strategy

### Unit Testing

- **Frontend:** Jest + React Testing Library
- **Backend:** Jest + Supertest
- **Coverage Target:** 80%+

### Integration Testing

- **API Tests:** Supertest + Test Database
- **Database Tests:** Supabase Test Instance
- **E2E Tests:** Playwright (للمسارات الحرجة)

### Testing Best Practices

1. **Test Isolation:** كل test مستقل
2. **Mock External Services:** Mock Supabase Client في Tests
3. **Test Data:** استخدام Factories للـ Test Data
4. **CI Integration:** تشغيل Tests في CI Pipeline

