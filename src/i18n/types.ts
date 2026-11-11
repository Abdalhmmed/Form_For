export type LangCode =
  | 'ar'
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'tr'
  | 'ur'
  | 'fa'
  | 'zh'
  | 'ru'
  | 'id'
  | 'it'
  | 'pt'
  | 'ja'
  | 'hi';

export interface LanguageInfo {
  code: LangCode;
  name: string;      // الاسم باللغة نفسها (Endonym)
  nativeName: string;// الاسم بالإنجليزية للبحث
  dir: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'العربية', nativeName: 'Arabic', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', nativeName: 'French', dir: 'ltr' },
  { code: 'es', name: 'Español', nativeName: 'Spanish', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', nativeName: 'German', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Turkish', dir: 'ltr' },
  { code: 'ur', name: 'اردو', nativeName: 'Urdu', dir: 'rtl' },
  { code: 'fa', name: 'فارسی', nativeName: 'Persian', dir: 'rtl' },
  { code: 'zh', name: '中文', nativeName: 'Chinese', dir: 'ltr' },
  { code: 'ru', name: 'Русский', nativeName: 'Russian', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Indonesian', dir: 'ltr' },
  { code: 'it', name: 'Italiano', nativeName: 'Italian', dir: 'ltr' },
  { code: 'pt', name: 'Português', nativeName: 'Portuguese', dir: 'ltr' },
  { code: 'ja', name: '日本語', nativeName: 'Japanese', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', nativeName: 'Hindi', dir: 'ltr' },
];

export interface TranslationDictionary {
  brand: string;
  home: {
    heroTitle: string;
    heroLead: string;
    newFormBtn: string;
    step1: string;
    step2: string;
    step3: string;
    openDropzoneTitle: string;
    openDropzoneHint: string;
  };
  topbar: {
    designTab: string;
    fillTab: string;
    openBtn: string;
    exportBtn: string;
    undoTooltip: string;
    redoTooltip: string;
    schemaExported: string;
    aboutTab: string;
    homeBtn: string;
  };
  builder: {
    fieldTypesHeading: string;
    deskEmptyHint: string;
    descriptionPlaceholder: string;
    itemsCount: string;
    inputsCount: string;
    unsavedChanges: string;
    noNewChanges: string;
    addFieldMobile: string;
    closePanel: string;
  };
  groups: {
    texts: string;
    choices: string;
    layout: string;
    others: string;
  };
  fieldTypes: {
    text: string;
    textarea: string;
    number: string;
    email: string;
    phone: string;
    date: string;
    select: string;
    radio: string;
    checkbox: string;
    section: string;
    paragraph: string;
    signature: string;
  };
  properties: {
    formSettings: string;
    logoLegend: string;
    chooseImage: string;
    removeLogo: string;
    logoHint: string;
    selectFieldHint: string;
    moveUp: string;
    moveDown: string;
    duplicate: string;
    deleteField: string;
    basicLegend: string;
    labelOrText: string;
    placeholder: string;
    required: string;
    optionsLegend: string;
    addOption: string;
    validationLegend: string;
    minLength: string;
    maxLength: string;
    minValue: string;
    maxValue: string;
    layoutLegend: string;
    fullWidth: string;
    halfWidth: string;
    logoTooLarge: string;
  };
  filler: {
    instruction: string;
    clearFields: string;
    savePdf: string;
    clearSignature: string;
    selectPlaceholder: string;
    oneError: string;
    multipleErrors: string;
    fieldNeedsCorrection: string;
  };
  validation: {
    required: string;
    minLength: string;
    maxLength: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidNumber: string;
    minValue: string;
    maxValue: string;
  };
  dialogs: {
    confirm: string;
    cancel: string;
    unsavedTitle: string;
    unsavedMessage: string;
    clearFieldsTitle: string;
    clearFieldsMessage: string;
    clearFieldsConfirm: string;
  };
  credits: {
    allRightsReserved: string;
    authorName: string;
  };
  aboutPage: {
    title: string;
    lead: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    workflowTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    responsiveTitle: string;
    responsiveDesc: string;
    undoRedoTitle: string;
    undoRedoDesc: string;
    authorSubtitle: string;
    authorDesc: string;
    authorLegalNote: string;
    startDesigningBtn: string;
  };
}
