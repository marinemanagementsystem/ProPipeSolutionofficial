import { z } from 'zod';

// ==================== EXPENSE SCHEMAS ====================

export const ExpenseTypeSchema = z.enum(['COMPANY_OFFICIAL', 'PERSONAL', 'ADVANCE']);
export const ExpenseStatusSchema = z.enum(['PAID', 'UNPAID']);
export const PaymentMethodSchema = z.enum(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER']);
export const CurrencySchema = z.enum(['TRY', 'USD', 'EUR']);

export const ExpenseFormSchema = z.object({
      amount: z.number({ message: 'Tutar zorunludur ve bir sayı olmalıdır' })
            .positive({ message: 'Tutar sıfırdan büyük olmalıdır' }),

      description: z.string({ message: 'Açıklama zorunludur' })
            .min(3, { message: 'Açıklama en az 3 karakter olmalıdır' })
            .max(500, { message: 'Açıklama en fazla 500 karakter olabilir' }),

      date: z.date({ message: 'Geçerli bir tarih giriniz' }),

      type: ExpenseTypeSchema,
      status: ExpenseStatusSchema,
      currency: CurrencySchema,
      paymentMethod: PaymentMethodSchema.optional(),

      ownerId: z.string().optional(),
      projectId: z.string().optional(),
      category: z.string().optional(),
      receiptFile: z.instanceof(File).optional(),
});

export type ExpenseFormInput = z.infer<typeof ExpenseFormSchema>;

// ==================== NETWORK CONTACT SCHEMAS ====================

export const NetworkCategorySchema = z.enum([
      'YENI_INSA', 'TAMIR', 'YAT', 'ASKERI_PROJE', 'TANKER', 'DIGER'
]);

export const ContactStatusSchema = z.enum(['BEKLEMEDE', 'ULASILDI', 'ULASILMIYOR']);
export const QuoteStatusSchema = z.enum([
      'HAYIR', 'TEKLIF_BEKLENIYOR', 'TEKLIF_VERILDI', 'TEKLIF_VERILECEK', 'GORUSME_DEVAM_EDIYOR'
]);
export const ResultStatusSchema = z.enum([
      'BEKLEMEDE', 'KAZANILDI', 'RED', 'IS_YOK', 'DONUS_YOK'
]);
export const ServiceAreaSchema = z.enum(['BORU', 'BORU_TECHIZ', 'DIGER']);

export const NetworkContactFormSchema = z.object({
      companyName: z.string({ message: 'Firma adı zorunludur' })
            .min(2, { message: 'Firma adı en az 2 karakter olmalıdır' })
            .max(100, { message: 'Firma adı en fazla 100 karakter olabilir' }),

      contactPerson: z.string({ message: 'İlgili kişi zorunludur' })
            .min(2, { message: 'İlgili kişi en az 2 karakter olmalıdır' })
            .max(100, { message: 'İlgili kişi en fazla 100 karakter olabilir' }),

      phone: z.string()
            .regex(/^[\d\s\-+()]*$/, { message: 'Geçerli bir telefon numarası giriniz' })
            .optional()
            .or(z.literal('')),

      email: z.string()
            .email({ message: 'Geçerli bir e-posta adresi giriniz' })
            .optional()
            .or(z.literal('')),

      category: NetworkCategorySchema,
      serviceArea: ServiceAreaSchema.optional(),
      shipType: z.string().max(100, { message: 'Gemi tipi en fazla 100 karakter olabilir' }).optional(),
      contactStatus: ContactStatusSchema,
      quoteStatus: QuoteStatusSchema,
      quoteDate: z.date().optional(),
      result: ResultStatusSchema.optional(),
      notes: z.string().max(1000, { message: 'Notlar en fazla 1000 karakter olabilir' }).optional(),
});

export type NetworkContactFormInput = z.infer<typeof NetworkContactFormSchema>;

// ==================== PROJECT SCHEMAS ====================

export const ProjectFormSchema = z.object({
      name: z.string({ message: 'Tersane adı zorunludur' })
            .min(2, { message: 'Tersane adı en az 2 karakter olmalıdır' })
            .max(100, { message: 'Tersane adı en fazla 100 karakter olabilir' }),

      location: z.string({ message: 'Lokasyon zorunludur' })
            .min(2, { message: 'Lokasyon en az 2 karakter olmalıdır' })
            .max(200, { message: 'Lokasyon en fazla 200 karakter olabilir' }),
});

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;

// ==================== PARTNER SCHEMAS ====================

export const PartnerFormSchema = z.object({
      name: z.string({ message: 'Ortak adı zorunludur' })
            .min(2, { message: 'Ortak adı en az 2 karakter olmalıdır' })
            .max(100, { message: 'Ortak adı en fazla 100 karakter olabilir' }),

      sharePercentage: z.number({ message: 'Hisse oranı zorunludur ve bir sayı olmalıdır' })
            .min(0, { message: 'Hisse oranı 0\'dan küçük olamaz' })
            .max(100, { message: 'Hisse oranı 100\'den büyük olamaz' }),

      baseSalary: z.number({ message: 'Maaş zorunludur ve bir sayı olmalıdır' })
            .min(0, { message: 'Maaş 0\'dan küçük olamaz' }),
});

export type PartnerFormInput = z.infer<typeof PartnerFormSchema>;

// ==================== PARTNER STATEMENT SCHEMAS ====================

export const PartnerStatementFormSchema = z.object({
      month: z.number({ message: 'Ay zorunludur' })
            .min(1, { message: 'Ay 1-12 arasında olmalıdır' })
            .max(12, { message: 'Ay 1-12 arasında olmalıdır' }),

      year: z.number({ message: 'Yıl zorunludur' })
            .min(2020, { message: 'Yıl 2020\'den küçük olamaz' })
            .max(2100, { message: 'Yıl 2100\'den büyük olamaz' }),

      previousBalance: z.number({ message: 'Önceki bakiye bir sayı olmalıdır' }).default(0),

      personalExpenseReimbursement: z.number({ message: 'Hakediş bir sayı olmalıdır' })
            .min(0, { message: 'Hakediş 0\'dan küçük olamaz' }).default(0),

      monthlySalary: z.number({ message: 'Aylık maaş bir sayı olmalıdır' })
            .min(0, { message: 'Aylık maaş 0\'dan küçük olamaz' }).default(0),

      profitShare: z.number({ message: 'Kar payı bir sayı olmalıdır' })
            .min(0, { message: 'Kar payı 0\'dan küçük olamaz' }).default(0),

      actualWithdrawn: z.number({ message: 'Çekilen tutar bir sayı olmalıdır' })
            .min(0, { message: 'Çekilen tutar 0\'dan küçük olamaz' }).default(0),

      note: z.string().max(500, { message: 'Not en fazla 500 karakter olabilir' }).optional(),
});

export type PartnerStatementFormInput = z.infer<typeof PartnerStatementFormSchema>;

// ==================== STATEMENT LINE SCHEMAS ====================

export const StatementLineDirectionSchema = z.enum(['INCOME', 'EXPENSE']);

export const StatementLineFormSchema = z.object({
      description: z.string({ message: 'Açıklama zorunludur' })
            .min(2, { message: 'Açıklama en az 2 karakter olmalıdır' })
            .max(200, { message: 'Açıklama en fazla 200 karakter olabilir' }),

      amount: z.number({ message: 'Tutar zorunludur ve bir sayı olmalıdır' })
            .positive({ message: 'Tutar sıfırdan büyük olmalıdır' }),

      direction: StatementLineDirectionSchema,
      isPaid: z.boolean().default(true),
});

export type StatementLineFormInput = z.infer<typeof StatementLineFormSchema>;

// ==================== LOGIN SCHEMAS ====================

export const LoginFormSchema = z.object({
      email: z.string({ message: 'E-posta zorunludur' })
            .email({ message: 'Geçerli bir e-posta adresi giriniz' }),

      password: z.string({ message: 'Şifre zorunludur' })
            .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
});

export type LoginFormInput = z.infer<typeof LoginFormSchema>;

// ==================== VALIDATION HELPERS ====================

/**
 * Bir değeri verilen şema ile doğrular ve hataları döndürür
 */
export function validateWithSchema<T>(
      schema: z.ZodSchema<T>,
      data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
      const result = schema.safeParse(data);

      if (result.success) {
            return { success: true, data: result.data };
      }

      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            if (!errors[path]) {
                  errors[path] = issue.message;
            }
      });

      return { success: false, errors };
}

/**
 * Tek bir alan için hata mesajı döndürür
 */
export function getFieldError(
      errors: Record<string, string> | undefined,
      field: string
): string | undefined {
      return errors?.[field];
}
