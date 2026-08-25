PORTFOLIO FINAL V4
===================

التعديلات:
1) مسافة أكبر بين أصنع / فكرةً / تُرى.
2) Admin responsive للهاتف والتابلت.
3) إضافة مشروع: اسم + نوع + صور + نشر.
4) عند تفعيل Supabase، الصور والمشاريع تنشر مباشرة للجميع بدون تعديل الكود.
5) تحسين أداء الكاروسيل على اللابتوب/Safari:
   - إلغاء wheel interception.
   - native horizontal scrolling.
   - drag بالماوس.
   - إزالة blur/filter والحركات المستمرة.
   - custom cursor لا يعمل animation loop دائم.
6) نصوص رئيسية مصقولة وأكثر احترافية وقرباً من القارئ.

تشغيل عادي:
افتح index.html عبر Live Server.

لتفعيل CMS الحقيقي (مرة واحدة):
1. أنشئ مشروع Supabase.
2. افتح SQL Editor وشغّل SUPABASE-SETUP.sql.
3. من Authentication أنشئ مستخدم الإدارة بإيميل وكلمة مرور، وعطّل التسجيل العام إن لم تكن تحتاجه.
4. من Project Settings / API انسخ Project URL و anon key.
5. افتح assets/js/supabase-config.js:
   enabled: true
   url: "..."
   anonKey: "..."
6. ارفع النسخة إلى GitHub Pages.
بعدها: افتح admin.html، سجّل الدخول، وارفع المشاريع مباشرة.

بدون Supabase:
الإدارة تعمل بوضع محلي للتجربة فقط، والتعديلات تبقى في نفس المتصفح ولا تظهر للزوار.
