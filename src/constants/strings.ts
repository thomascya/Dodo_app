/**
 * DODO App - String Constants
 * Centralized strings in Hebrew and English
 * Future: Can be converted to i18n framework
 */

export const STRINGS = {
  // Common
  loading: 'טוען...',
  error: 'שגיאה',
  retry: 'נסה שוב',
  close: 'סגור',
  save: 'שמור',
  cancel: 'ביטול',
  delete: 'מחק',
  edit: 'ערוך',
  share: 'שתף',
  comingSoon: 'בקרוב...',

  // Error Messages
  errorGeneric: 'אירעה שגיאה. נסה שוב.',
  errorNetwork: 'בעיית רשת. בדוק את החיבור שלך.',
  errorLoadingStores: 'אירעה שגיאה בטעינת החנויות',
  errorLoadingBenefits: 'אירעה שגיאה בטעינת ההטבות',
  errorLoadingCoupons: 'אירעה שגיאה בטעינת הקופונים',
  errorSearching: 'אירעה שגיאה בחיפוש',
  errorCopyingCode: 'לא ניתן להעתיק את הקוד',

  // Home Screen
  homeTitle: 'חיפוש',
  homeSearchPlaceholder: 'חפש חנות...',
  homeFeaturedBenefits: 'הטבות מומלצות',
  homeSearchResults: 'תוצאות חיפוש',
  homeStartSearching: 'התחל לחפש חנות...',
  homeNoResults: 'לא נמצאו תוצאות',
  homeNoResultsSubtext: 'נסה לחפש משהו אחר',
  homeSearching: 'מחפש...',

  // Store Screen
  storeBenefitsTitle: 'ההטבות שלך',
  storeCouponsTitle: 'קופונים מהקהילה',
  storeNotFound: 'החנות לא נמצאה',
  storeNoBenefits: 'אין הטבות זמינות כרגע',
  storeNoCoupons: 'אין קופונים פעילים כרגע',
  storeLoading: 'טוען...',

  // Coupon Strings
  couponCopied: 'הקוד הועתק!',
  couponCopiedMessage: (code: string) => `הקוד ${code} הועתק ללוח`,
  couponCopyButton: 'העתק קוד',
  couponExpiresAt: (date: string) => `פג תוקף: ${date}`,

  // Discount Formatting
  couponDiscount: {
    percentage: (value: number) => `${value}% הנחה`,
    fixed: (value: number) => `₪${value} הנחה`,
  },

  // Wallet Types
  walletCreditCard: 'כרטיס',
  walletClub: 'מועדון',

  // Redemption Types
  redemptionOnline: '🌐',
  redemptionPhysical: '🏪',
  redemptionBoth: '🌐🏪',

  // Filter Types
  filterStores: 'חנויות',
  filterPeople: 'אנשים',
  filterProducts: 'מוצרים',
  filterLocations: 'מיקומים',
  filterFeatureSoonMessage: 'פיצ\'ר זה יהיה זמין בקרוב!',

  // Empty States
  emptySearchIcon: '🔍',
  emptyNoBenefitsIcon: '💳',
  emptyNoCouponsIcon: '🎟️',
  emptyNoResultsIcon: '😕',
  emptyStoreIcon: '🏪',

  // Following Screen
  followingTitle: 'במעקב',
  followingEmpty: 'אתה עדיין לא עוקב אחרי אף אחד',
  followingEmptySubtext: 'התחל לעקוב אחרי אינפלואנסרים כדי לראות את הקופונים שלהם',

  // Profile Screen
  profileTitle: 'פרופיל',
  profileSignIn: 'התחבר',
  profileSignOut: 'התנתק',
  profileEdit: 'ערוך פרופיל',
  profileMyWallets: 'הארנקים שלי',
  profileSettings: 'הגדרות',

  // Report Dialog
  reportTitle: 'דווח על בעיה',
  reportReasonNotWorking: 'הקוד לא עובד',
  reportReasonExpired: 'הקוד פג תוקפו',
  reportReasonInappropriate: 'תוכן לא הולם',
  reportReasonOther: 'אחר',
  reportDetailsPlaceholder: 'פרטים נוספים (אופציונלי)',
  reportSubmit: 'שלח דיווח',
  reportSuccess: 'תודה!',
  reportSuccessMessage: 'הדיווח נשלח בהצלחה',
  reportError: 'שגיאה',
  reportErrorMessage: 'לא ניתן לשלוח את הדיווח',
};
