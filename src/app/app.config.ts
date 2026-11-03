import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * الـ scroll restoration بتاعة الراوتر متقفلة عن قصد: الصفحة الرئيسية بتستخدم روابط #section عادية،
 * ومع تفعيلها الراوتر بيرجّع الصفحة لفوق مع كل تغيير في الـ hash.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(routes)],
};
