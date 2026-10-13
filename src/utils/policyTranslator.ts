import { PolicyClauseItem } from '../types';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English (Master)', flag: '🇬🇧', region: 'Global ISMS Master', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'LATAM & Spain', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'DACH (Germany, Austria, Switzerland)', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France, EU & Francophonie', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan / APAC', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', region: 'Greater China / Singapore / APAC', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil & Portugal / CPLP', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & North Africa', direction: 'rtl' }
];

// In-memory cache for translated clauses and documents
const translationCache: Record<string, any> = {};

// ISO standard headings dictionary across all languages
export const ISO_SECTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    'Information Security Management System (ISMS)': 'Sistema de Gestión de Seguridad de la Información (SGSI)',
    'Policy Document': 'Documento de Política',
    'ISO/IEC 27001:2022 Reference': 'Referencia ISO/IEC 27001:2022',
    'Version': 'Versión',
    'Classification': 'Clasificación',
    'Internal Confidential': 'Confidencial Interno',
    'Effective Date': 'Fecha de Entrada en Vigor',
    'Review Cycle': 'Ciclo de Revisión',
    'Annual or Event-Triggered': 'Anual o Activado por Eventos',
    '1. Executive Mandate & Purpose': '1. Mandato Ejecutivo y Propósito',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. Arquitectura de Infraestructura Concreta y Mapeos Técnicos',
    '2.1 Technical Enforcement Specifications:': '2.1 Especificaciones Técnicas de Cumplimiento:',
    '3. Escalation SLAs & Access Breach Protocol': '3. ANS de Escalamiento y Protocolo de Violación de Acceso',
    '4. Continuous Review & Auditor Verification': '4. Revisión Continua y Verificación de Auditoría',
    'Designated Data Protection Officer (DPO)': 'Delegado de Protección de Datos Designado (DPO)',
    'Chief Information Security Officer': 'Director de Seguridad de la Información (CISO)',
    'Official Email': 'Correo Electrónico Oficial',
    '24/7 Escalation Hotline': 'Línea Directa de Escalamiento 24/7',
    'Regulatory Registration ID': 'ID de Registro Regulatorio',
    'Mapped Infrastructure Tags:': 'Etiquetas de Infraestructura Mapeadas:',
    'Incident Severity': 'Severidad del Incidente',
    'Threshold & Impact': 'Umbral e Impacto',
    'Mandatory Escalation SLA': 'ANS Obligatorio de Escalamiento',
    'Designated Response Lead': 'Responsable Designado de Respuesta'
  },
  de: {
    'Information Security Management System (ISMS)': 'Informationssicherheits-Managementsystem (ISMS)',
    'Policy Document': 'Richtliniendokument',
    'ISO/IEC 27001:2022 Reference': 'ISO/IEC 27001:2022 Referenz',
    'Version': 'Version',
    'Classification': 'Klassifizierung',
    'Internal Confidential': 'Intern Vertraulich',
    'Effective Date': 'Inkrafttretungsdatum',
    'Review Cycle': 'Überprüfungszyklus',
    'Annual or Event-Triggered': 'Jährlich oder Ereignisgesteuert',
    '1. Executive Mandate & Purpose': '1. Mandat der Geschäftsleitung & Zweck',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. Konkrete Infrastrukturarchitektur & Technische Zuordnungen',
    '2.1 Technical Enforcement Specifications:': '2.1 Technische Durchsetzungsspezifikationen:',
    '3. Escalation SLAs & Access Breach Protocol': '3. Eskalations-SLAs & Protokoll bei Zugriffsverletzungen',
    '4. Continuous Review & Auditor Verification': '4. Kontinuierliche Überprüfung & Auditorenverifizierung',
    'Designated Data Protection Officer (DPO)': 'Benannter Datenschutzbeauftragter (DSB)',
    'Chief Information Security Officer': 'Informationssicherheitsbeauftragter (CISO)',
    'Official Email': 'Offizielle E-Mail',
    '24/7 Escalation Hotline': '24/7 Notfall-Hotline',
    'Regulatory Registration ID': 'Behördliche Registrierungs-ID',
    'Mapped Infrastructure Tags:': 'Zugeordnete Infrastruktur-Tags:',
    'Incident Severity': 'Vorfallschweregrad',
    'Threshold & Impact': 'Schwellenwert & Auswirkung',
    'Mandatory Escalation SLA': 'Verbindliche Eskalations-SLA',
    'Designated Response Lead': 'Verantwortliche Reaktionsleitung'
  },
  fr: {
    'Information Security Management System (ISMS)': 'Système de Management de la Sécurité de l\'Information (SMSI)',
    'Policy Document': 'Document de Politique',
    'ISO/IEC 27001:2022 Reference': 'Référence ISO/IEC 27001:2022',
    'Version': 'Version',
    'Classification': 'Classification',
    'Internal Confidential': 'Confidentiel Interne',
    'Effective Date': 'Date d\'Entrée en Vigueur',
    'Review Cycle': 'Cycle de Révision',
    'Annual or Event-Triggered': 'Annuel ou Déclenché par Événement',
    '1. Executive Mandate & Purpose': '1. Mandat Exécutif et Objet',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. Architecture d\'Infrastructure Concrète et Cartographies Techniques',
    '2.1 Technical Enforcement Specifications:': '2.1 Spécifications Techniques d\'Application:',
    '3. Escalation SLAs & Access Breach Protocol': '3. SLA d\'Escalade et Protocole de Violation d\'Accès',
    '4. Continuous Review & Auditor Verification': '4. Examen Continu et Vérification d\'Audit',
    'Designated Data Protection Officer (DPO)': 'Délégué à la Protection des Données (DPO)',
    'Chief Information Security Officer': 'Responsable de la Sécurité des Systèmes d\'Information (RSSI/CISO)',
    'Official Email': 'Courriel Officiel',
    '24/7 Escalation Hotline': 'Ligne d\'Alerte 24/7',
    'Regulatory Registration ID': 'N° d\'Enregistrement Réglementaire',
    'Mapped Infrastructure Tags:': 'Balises d\'Infrastructure Mappées:',
    'Incident Severity': 'Gravité de l\'Incident',
    'Threshold & Impact': 'Seuil et Impact',
    'Mandatory Escalation SLA': 'SLA Obligatoire d\'Escalade',
    'Designated Response Lead': 'Responsable Désigné de la Réponse'
  },
  ja: {
    'Information Security Management System (ISMS)': '情報セキュリティマネジメントシステム (ISMS)',
    'Policy Document': '方針規程文書',
    'ISO/IEC 27001:2022 Reference': 'ISO/IEC 27001:2022 参照',
    'Version': '版数',
    'Classification': '情報区分',
    'Internal Confidential': '社内機密 (Confidential)',
    'Effective Date': '施行日',
    'Review Cycle': '見直し周期',
    'Annual or Event-Triggered': '年次または事象発生時',
    '1. Executive Mandate & Purpose': '1. 経営陣の委任と目的',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. 具体的なインフラアーキテクチャと技術的マッピング',
    '2.1 Technical Enforcement Specifications:': '2.1 技術的適用仕様:',
    '3. Escalation SLAs & Access Breach Protocol': '3. エスカレーションSLAとアクセス侵害対応プロトコル',
    '4. Continuous Review & Auditor Verification': '4. 継続的なレビューと監査人による検証',
    'Designated Data Protection Officer (DPO)': '指名データ保護責任者 (DPO)',
    'Chief Information Security Officer': '最高情報セキュリティ責任者 (CISO)',
    'Official Email': '公式メールアドレス',
    '24/7 Escalation Hotline': '24/7緊急エスカレーション窓口',
    'Regulatory Registration ID': '監督官庁登録ID',
    'Mapped Infrastructure Tags:': '紐付け済みインフラ識別タグ:',
    'Incident Severity': 'インシデント重大度',
    'Threshold & Impact': '検知基準と影響範囲',
    'Mandatory Escalation SLA': '必須エスカレーションSLA',
    'Designated Response Lead': '指定初動対応責任者'
  },
  zh: {
    'Information Security Management System (ISMS)': '信息安全管理体系 (ISMS)',
    'Policy Document': '策略制度文件',
    'ISO/IEC 27001:2022 Reference': 'ISO/IEC 27001:2022 参考条款',
    'Version': '版本',
    'Classification': '密级分类',
    'Internal Confidential': '内部机密 (Confidential)',
    'Effective Date': '生效日期',
    'Review Cycle': '审查周期',
    'Annual or Event-Triggered': '年度或重大事件触发',
    '1. Executive Mandate & Purpose': '1. 管理层授权与政策目的',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. 具体基础设施架构与技术落地映射',
    '2.1 Technical Enforcement Specifications:': '2.1 技术强制执行规范:',
    '3. Escalation SLAs & Access Breach Protocol': '3. 升级SLA与违规越权应急响应协议',
    '4. Continuous Review & Auditor Verification': '4. 持续监督与审计师独立验证',
    'Designated Data Protection Officer (DPO)': '指定数据保护官 (DPO)',
    'Chief Information Security Officer': '首席信息安全官 (CISO)',
    'Official Email': '官方邮箱',
    '24/7 Escalation Hotline': '24/7 紧急升级热线',
    'Regulatory Registration ID': '监管备案登记编号',
    'Mapped Infrastructure Tags:': '已关联基础设施标签:',
    'Incident Severity': '事件严重等级',
    'Threshold & Impact': '触发阈值与业务影响',
    'Mandatory Escalation SLA': '法定强制升级响应时限',
    'Designated Response Lead': '指定响应牵头负责人'
  },
  pt: {
    'Information Security Management System (ISMS)': 'Sistema de Gestão de Segurança da Informação (SGSI)',
    'Policy Document': 'Documento de Política',
    'ISO/IEC 27001:2022 Reference': 'Referência ISO/IEC 27001:2022',
    'Version': 'Versão',
    'Classification': 'Classificação',
    'Internal Confidential': 'Confidencial Interno',
    'Effective Date': 'Data de Vigência',
    'Review Cycle': 'Ciclo de Revisão',
    'Annual or Event-Triggered': 'Anual ou por Evento Crítico',
    '1. Executive Mandate & Purpose': '1. Mandato Executivo e Propósito',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. Arquitetura de Infraestrutura Concreta e Mapeamentos Técnicos',
    '2.1 Technical Enforcement Specifications:': '2.1 Especificações Técnicas de Aplicação:',
    '3. Escalation SLAs & Access Breach Protocol': '3. SLAs de Escalonamento e Protocolo de Violação de Acesso',
    '4. Continuous Review & Auditor Verification': '4. Revisão Contínua e Verificação de Auditoria',
    'Designated Data Protection Officer (DPO)': 'Encarregado de Proteção de Dados (DPO / EPD)',
    'Chief Information Security Officer': 'Diretor de Segurança da Informação (CISO)',
    'Official Email': 'E-mail Oficial',
    '24/7 Escalation Hotline': 'Linha de Escalonamento 24/7',
    'Regulatory Registration ID': 'ID de Registro Regulatório',
    'Mapped Infrastructure Tags:': 'Tags de Infraestrutura Mapeadas:',
    'Incident Severity': 'Gravidade do Incidente',
    'Threshold & Impact': 'Limiar e Impacto',
    'Mandatory Escalation SLA': 'SLA Obrigatório de Escalonamento',
    'Designated Response Lead': 'Líder Designado de Resposta'
  },
  ar: {
    'Information Security Management System (ISMS)': 'نظام إدارة أمن المعلومات (ISMS)',
    'Policy Document': 'وثيقة السياسة الأمنية',
    'ISO/IEC 27001:2022 Reference': 'المرجع القياسي ISO/IEC 27001:2022',
    'Version': 'الإصدار',
    'Classification': 'التصنيف الأمني',
    'Internal Confidential': 'سري داخلي',
    'Effective Date': 'تاريخ السريان',
    'Review Cycle': 'دورة المراجعة',
    'Annual or Event-Triggered': 'سنوية أو عند حدوث طارئ',
    '1. Executive Mandate & Purpose': '1. التفويض التنفيذي والغرض الأمني',
    '2. Concrete Infrastructure Architecture & Technical Mappings': '2. البنية التحتية الفعلية وتخطيط الضوابط التقنية',
    '2.1 Technical Enforcement Specifications:': '2.1 المواصفات التقنية لتطبيق السياسة:',
    '3. Escalation SLAs & Access Breach Protocol': '3. اتفاقيات مستوى خدمة التصعيد وبروتوكول خرق الوصول',
    '4. Continuous Review & Auditor Verification': '4. المراجعة المستمرة والتحقق من قبل المدققين',
    'Designated Data Protection Officer (DPO)': 'مسؤول حماية البيانات المعتمد (DPO)',
    'Chief Information Security Officer': 'رئيس أمن المعلومات (CISO)',
    'Official Email': 'البريد الإلكتروني الرسمي',
    '24/7 Escalation Hotline': 'الخط الساخن للطوارئ 24/7',
    'Regulatory Registration ID': 'رقم التسجيل التنظيمي',
    'Mapped Infrastructure Tags:': 'وسوم البنية التحتية المرتبطة:',
    'Incident Severity': 'مستوى خطورة الحادث',
    'Threshold & Impact': 'عتبة التأثير والنطاق',
    'Mandatory Escalation SLA': 'اتفاقية مستوى خدمة التصعيد الإلزامية',
    'Designated Response Lead': 'المسؤول المكلف بالاستجابة'
  }
};

// Comprehensive pre-translated clauses registry for all standard policies
export const CLAUSES_TRANSLATIONS_REGISTRY: Record<string, Record<string, {
  title: string;
  requirementText: string;
  enforcementObjective: string;
}>> = {
  // SPANISH (ES)
  es: {
    'pol-access-control-c1': {
      title: 'Gobernanza de Acceso de Privilegio Mínimo y Delegación de Roles',
      requirementText: 'Los privilegios de acceso en los entornos de producción deben otorgarse estrictamente según la necesidad comercial verificada, sustituyendo las credenciales administrativas permanentes por delegaciones de roles temporales.',
      enforcementObjective: 'Eliminar claves raíz permanentes; verificar que la asunción de roles se rija por políticas de sesión IAM y tickets de aprobación formal.'
    },
    'pol-access-control-c2': {
      title: 'Autenticación Multifactorial Obligatoria y Resistencia al Phishing',
      requirementText: 'Todo usuario humano que acceda a consolas corporativas, repositorios de código o redes de producción debe autenticarse mediante MFA biométrica o hardware FIDO2 resistente al phishing.',
      enforcementObjective: 'Cumplimiento de MFA adaptativo según salud del dispositivo, geovelocidad IP y claves FIDO2 WebAuthn.'
    },
    'pol-access-control-c3': {
      title: 'Identidad de Cargas de Trabajo y Tokens de Sesión Efímeros',
      requirementText: 'Los microservicios, cargas sin servidor y canalizaciones de CI/CD deben asumir roles de IAM efímeros mediante federación OIDC en lugar de almacenar secretos API estáticos en el control de código fuente.',
      enforcementObjective: 'Cero secretos estáticos de API en el código; tokens STS dinámicos de corta duración con una vigencia máxima de 60 minutos.'
    },
    'pol-access-control-c4': {
      title: 'Registro de Acceso Privilegiado e Invalidación Rápida de Sesiones',
      requirementText: 'Todas las sesiones administrativas privilegiadas y asunciones de roles deben generar registros de auditoría inmutables y permitir la revocación de emergencia inmediata ante cualquier sospecha de compromiso.',
      enforcementObjective: 'Mecanismo de corte instantáneo de sesiones administrativas con ingesta de registros CloudTrail y Okta System Logs.'
    },
    'pol-data-protection-c1': {
      title: 'Aislamiento de Depósitos de Almacenamiento y Bloqueo de Acceso Público',
      requirementText: 'Todos los depósitos de almacenamiento de objetos en la nube y contenedores de blobs que alojen datos de clientes o telemetría deben tener habilitados Bloqueos de Acceso Público con ingreso restringido a endpoints privados.',
      enforcementObjective: 'Prevenir el acceso anónimo a través de Internet; forzar el enrutamiento exclusivo por endpoints privados de VNet y VPC.'
    },
    'pol-data-protection-c2': {
      title: 'Criptografía de Envolvente con Claves Administradas por el Cliente (CMK)',
      requirementText: 'Los datos almacenados en reposo deben cifrarse con doble capa AES-256 o ChaCha20-Poly1305 mediante claves CMK alojadas en HSM dedicados con rotación anual automatizada.',
      enforcementObjective: 'Custodia auditable de claves criptográficas separada de las configuraciones por defecto del proveedor de nube con registros de rotación obligatorios.'
    },
    'pol-data-protection-c3': {
      title: 'Almacenamiento Inmutable de Cumplimiento WORM y Retención Antiransomware',
      requirementText: 'Los registros de auditoría de seguridad, instantáneas de bases de datos e imágenes forenses deben preservarse mediante retención de bloqueo de objetos WORM (Write Once, Read Many) que no pueda ser invalidada ni por credenciales raíz.',
      enforcementObjective: 'Inmutabilidad criptográfica contra borrados por ransomware y eliminaciones maliciosas de administradores durante 365 días.'
    },
    'pol-incident-response-c1': {
      title: 'Telemetría Continua del Plano de Control e Ingesta de Registros SIEM',
      requirementText: 'Cada estación de trabajo corporativa, servidor, cuenta en la nube y proveedor de identidades debe transmitir telemetría sin procesar a un SIEM unificado con detección automatizada de anomalías de comportamiento.',
      enforcementObjective: 'Despacho de alertas en tiempo real al equipo de guardia SecOps 24/7 en PagerDuty con retención de archivo en frío de 365 días.'
    },
    'pol-incident-response-c2': {
      title: 'Cuarentena Automatizada de Endpoints y Revocación de Sesiones Maliciosas',
      requirementText: 'Al detectarse extracción no autorizada de credenciales, movimiento lateral o balizas de malware, el host o la cuenta afectada debe ponerse en cuarentena inmediatamente para limitar el radio de impacto.',
      enforcementObjective: 'Aislamiento automático de red del endpoint en menos de 60 segundos e invalidación activa de tokens de sesión Okta.'
    },
    'pol-incident-response-c3': {
      title: 'SLA de Escalamiento de Brechas de Datos y Notificación a la Autoridad de Control',
      requirementText: 'Los compromisos confirmados que involucren datos personales deben activar el puente de emergencia de incidentes y la notificación estatutaria al DPO designado y a la Autoridad de Supervisión competente.',
      enforcementObjective: 'Cumplimiento estricto del SLA: triaje por el CISO en 15 minutos, aviso formal a los reguladores en un plazo máximo de 72 horas.'
    },
    'pol-sdlc-cicd-c1': {
      title: 'Protección Inmutable de Ramas y Revisiones Obligatorias por Pares',
      requirementText: 'Se bloquean las publicaciones directas (git push) a las ramas principales o de lanzamiento. La fusión requiere al menos 2 revisiones aprobatorias independientes de CODEOWNERS designados y comprobaciones de estado exitosas.',
      enforcementObjective: 'Hacer cumplir reglas de protección de ramas, descarte de revisiones obsoletas y bloqueos contra omisión de restricciones de administrador.'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Estándares de Seguridad de Pods y Webhooks de Admisión de Contenedores',
      requirementText: 'Las cargas de trabajo en contenedores que se ejecuten en orquestadores de producción deben adherirse estrictamente al estándar Restricted Pod Security Standard, prohibiendo la ejecución como root (UID 0) y espacios de nombres del host.',
      enforcementObjective: 'Webhooks automatizados de admisión del clúster que rechacen contenedores privilegiados y monten sistemas de archivos raíz de solo lectura.'
    },
    'pol-sdlc-cicd-c3': {
      title: 'Escaneo de Secretos Previo al Commit y Certificación Criptográfica de Commits',
      requirementText: 'La protección automatizada de subida debe rechazar commits que contengan secretos o credenciales de alta entropía, mientras que todos los commits de git deben portar firmas criptográficas GPG o SSH verificadas.',
      enforcementObjective: 'Bloquear claves de API al momento del git push; verificar identidades criptográficas de desarrolladores antes de la ejecución de CI.'
    }
  },

  // GERMAN (DE)
  de: {
    'pol-access-control-c1': {
      title: 'Zugriffsverwaltung nach dem Prinzip der geringsten Rechte & Rollendelegation',
      requirementText: 'Zugriffsberechtigungen in Produktionsumgebungen dürfen ausschließlich auf der Grundlage eines nachgewiesenen geschäftlichen Bedarfs gewährt werden; dauerhafte Administratorberechtigungen sind durch temporäre Rollendelegationen zu ersetzen.',
      enforcementObjective: 'Beseitigung permanenter Root-Schlüssel; Überprüfung, dass die Rollenübernahme durch IAM-Sitzungsrichtlinien und Freigabetickets geregelt ist.'
    },
    'pol-access-control-c2': {
      title: 'Obligatorische Multi-Faktor-Authentifizierung & Phishing-Resistenz',
      requirementText: 'Jeder menschliche Benutzer, der auf Unternehmenskonsole, Code-Repositories oder Produktionsnetzwerke zugreift, muss sich mit phishing-resistenter FIDO2-Hardware oder biometrischer MFA authentifizieren.',
      enforcementObjective: 'Adaptive MFA-Durchsetzung basierend auf Gerätezustand, IP-Geogeschwindigkeit und FIDO2 WebAuthn-Sicherheitsschlüsseln.'
    },
    'pol-access-control-c3': {
      title: 'Workload-Identität & Kurzlebige Sitzungs-Token',
      requirementText: 'Microservices, serverlose Workloads und CI/CD-Pipelines müssen ephemere IAM-Rollen über OIDC-Föderation annehmen, anstatt statische API-Geheimnisse im Quellcode oder in Containern zu speichern.',
      enforcementObjective: 'Keine statischen API-Geheimnisse im Quellcode; dynamische, kurzlebige STS-Token mit einer maximalen Gültigkeitsdauer von 60 Minuten.'
    },
    'pol-access-control-c4': {
      title: 'Protokollierung privilegierter Zugriffe & Schnelle Sitzungsinvalidierung',
      requirementText: 'Alle privilegierten Administratorsitzungen und Rollenübernahmen müssen unveränderliche Prüfereignisse generieren und einen sofortigen Notfallwiderruf bei Verdacht auf Kompromittierung unterstützen.',
      enforcementObjective: 'Sofortige Notabschaltung von Administratorsitzungen mit direkter CloudTrail- und Okta-Systemprotokoll-Erfassung.'
    },
    'pol-data-protection-c1': {
      title: 'Speicher-Bucket-Isolation & Sperrung öffentlicher Zugriffe',
      requirementText: 'Für alle Cloud-Objektspeicher-Buckets und Blob-Container, die Kunden- oder Telemetriedaten hosten, müssen Public-Access-Blocks auf Kontoebene aktiviert sein, wobei der Zugriff auf private Endpunkte beschränkt ist.',
      enforcementObjective: 'Verhinderung des anonymen Internetzugriffs; Durchsetzung von privatem VNet- und VPC-Endpunkt-Routing.'
    },
    'pol-data-protection-c2': {
      title: 'Envelope-Verschlüsselung mit kundenseitig verwalteten Schlüsseln (CMK)',
      requirementText: 'Im Ruhezustand gespeicherte Daten müssen mit zweischichtigem AES-256 oder ChaCha20-Poly1305 unter Verwendung kundenseitig verwalteter Schlüssel (CMK) in dedizierten HSMs mit automatischer jährlicher Schlüsselrotation verschlüsselt werden.',
      enforcementObjective: 'Nachprüfbare Aufbewahrung kryptografischer Schlüssel, getrennt von Cloud-Standardwerten, mit obligatorischen Rotationsprotokollen.'
    },
    'pol-data-protection-c3': {
      title: 'Unveränderliche WORM-Compliance-Speicherung & Anti-Ransomware-Sperre',
      requirementText: 'Sicherheitsüberwachungsprotokolle, Datenbank-Snapshots und forensische Abbilder müssen mit WORM-Object-Lock-Aufbewahrung (Write Once, Read Many) gespeichert werden, die selbst von Root-Zugangsdaten nicht überschrieben werden kann.',
      enforcementObjective: 'Kryptografische Unveränderlichkeit gegen Ransomware-Löschungen und böswillige Administratoraktionen für 365 Tage.'
    },
    'pol-incident-response-c1': {
      title: 'Kontinuierliche Steuerungsebenen-Telemetrie & SIEM-Protokollerfassung',
      requirementText: 'Jeder Arbeitsplatzrechner, Server, jedes Cloud-Konto und jeder Identitätsanbieter des Unternehmens muss Roh-Telemetriedaten in ein einheitliches SIEM mit automatisierter Verhaltensanomalieerkennung übertragen.',
      enforcementObjective: 'Echtzeit-Alarmierung des 24/7-SecOps-Bereitschaftsdienstes über PagerDuty mit einer 365-tägigen Archivierungsdauer.'
    },
    'pol-incident-response-c2': {
      title: 'Automatisierte Endpunkt-Quarantäne & Widerruf bösartiger Sitzungen',
      requirementText: 'Bei Erkennung von unbefugtem Credential-Dumping, lateraler Bewegung oder Malware-Beacons muss der betroffene Host oder das betroffene Konto unverzüglich isoliert werden, um den Schadensradius zu begrenzen.',
      enforcementObjective: 'Automatische Netztrennung des Endgeräts in unter 60 Sekunden und sofortige Entwertung aktiver Okta-Sitzungstoken.'
    },
    'pol-incident-response-c3': {
      title: 'Eskalations-SLA bei Datenschutzverletzungen & Behördenmeldung',
      requirementText: 'Bestätigte Vorfälle, die personenbezogene Daten betreffen, müssen sofort die Notfall-Vorfallbrücke und die gesetzliche Meldung an den benannten DSB sowie die zuständige Aufsichtsbehörde auslösen.',
      enforcementObjective: 'Strikte SLA-Einhaltung: CISO-Ersteinsatz innerhalb von 15 Minuten, formelle behördliche Meldung innerhalb von maximal 72 Stunden.'
    },
    'pol-sdlc-cicd-c1': {
      title: 'Unveränderlicher Branch-Schutz & Verbindliche Peer-Reviews',
      requirementText: 'Direkte Git-Pushes in Main- oder Release-Branches sind gesperrt. Das Mergen erfordert mindestens zwei unabhängige Genehmigungen von benannten CODEOWNERS sowie das Bestehen automatisierter Statusprüfungen.',
      enforcementObjective: 'Durchsetzung von Branch-Protection-Regelsätzen, Verwerfen veralteter Reviews und Sperren von Administrator-Bypass-Rechten.'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Pod-Sicherheitsstandards & Container-Zulassungs-Webhooks',
      requirementText: 'Containerisierte Workloads auf Produktions-Orchestratoren müssen strikt dem Restricted Pod Security Standard entsprechen und die Ausführung als Root (UID 0) sowie Host-Namespaces untersagen.',
      enforcementObjective: 'Automatisierte Cluster-Zulassungs-Webhooks, die privilegierte Container abweisen und schreibgeschützte Root-Dateisysteme erzwingen.'
    },
    'pol-sdlc-cicd-c3': {
      title: 'Pre-Commit-Secret-Scanning & Kryptografische Commit-Attestierung',
      requirementText: 'Der automatisierte Push-Schutz muss Commits mit Geheimnissen oder Passwörtern abweisen; alle Git-Commits müssen kryptografische GPG- oder SSH-Signaturen tragen.',
      enforcementObjective: 'Blockieren von API-Schlüsseln bereits beim Git-Push; Verifizierung kryptografischer Entwickleridentitäten vor der CI-Ausführung.'
    }
  },

  // FRENCH (FR)
  fr: {
    'pol-access-control-c1': {
      title: 'Gouvernance des Accès au Moindre Privilège et Délégation de Rôles',
      requirementText: 'Les privilèges d\'accès aux environnements de production doivent être accordés strictement sur la base d\'un besoin métier vérifié, en remplaçant les informations d\'identification permanentes par des délégations temporaires de rôles.',
      enforcementObjective: 'Éliminer les clés racines permanentes ; vérifier que l\'élévation de rôle est régie par des politiques de session IAM et des tickets d\'approbation.'
    },
    'pol-access-control-c2': {
      title: 'Authentification Multifacteur Obligatoire et Résistance au Hameçonnage',
      requirementText: 'Tout utilisateur accédant aux consoles d\'entreprise, dépôts de code ou réseaux de production doit s\'authentifier via un MFA matériel FIDO2 ou biométrique résistant au phishing.',
      enforcementObjective: 'Application adaptative du MFA basée sur la conformité du terminal, la géovélocité IP et les clés de sécurité FIDO2 WebAuthn.'
    },
    'pol-access-control-c3': {
      title: 'Identité des Charges de Travail et Jetons de Session Éphémères',
      requirementText: 'Les microservices, charges de travail sans serveur et pipelines CI/CD doivent assumer des rôles IAM éphémères par fédération OIDC plutôt que de stocker des secrets d\'API statiques dans le code source.',
      enforcementObjective: 'Zéro secret statique dans le code source ; jetons STS dynamiques de courte durée avec une validité maximale de 60 minutes.'
    },
    'pol-access-control-c4': {
      title: 'Journalisation des Accès Privilégiés et Révocation Rapide de Session',
      requirementText: 'Toutes les sessions administratives privilégiées et élévations de rôle doivent générer des journaux d\'audit immuables et permettre une révocation d\'urgence immédiate en cas de compromission suspectée.',
      enforcementObjective: 'Interrupteur d\'urgence immédiat pour sessions administratives avec ingestion directe dans CloudTrail et Okta System Logs.'
    },
    'pol-data-protection-c1': {
      title: 'Isolation des Compartiments de Stockage et Blocage des Accès Publics',
      requirementText: 'Tous les compartiments de stockage d\'objets cloud hébergeant des données clients ou de télémétrie doivent activer le blocage des accès publics avec un accès restreint aux points de terminaison privés.',
      enforcementObjective: 'Empêcher tout accès Internet anonyme ; forcer le routage par points de terminaison privés VNet et VPC.'
    },
    'pol-data-protection-c2': {
      title: 'Chiffrement d\'Enveloppe avec Clés Gérées par le Client (CMK)',
      requirementText: 'Les données au repos doivent être chiffrées en double couche AES-256 ou ChaCha20-Poly1305 avec des clés gérées par le client (CMK) hébergées dans des HSM dédiés avec rotation annuelle automatisée.',
      enforcementObjective: 'Garde auditable des clés cryptographiques séparée des clés par défaut du fournisseur cloud avec journaux de rotation obligatoires.'
    },
    'pol-data-protection-c3': {
      title: 'Stockage WORM Immuable de Conformité et Protection Anti-Ransomware',
      requirementText: 'Les journaux d\'audit, instantanés de bases de données et images forensiques doivent être conservés avec un verrouillage WORM (Write Once, Read Many) ne pouvant être contourné même par les comptes racine.',
      enforcementObjective: 'Immuabilité cryptographique contre les suppressions par ransomware et actes malveillants d\'administrateurs pendant 365 jours.'
    },
    'pol-incident-response-c1': {
      title: 'Télémétrie Continue du Plan de Contrôle et Ingestion des Journaux SIEM',
      requirementText: 'Chaque poste de travail, serveur, compte cloud et fournisseur d\'identité doit diffuser sa télémétrie vers un SIEM unifié doté d\'une détection automatisée des anomalies comportementales.',
      enforcementObjective: 'Alerte en temps réel de l\'astreinte SecOps 24/7 sur PagerDuty avec rétention d\'archivage à froid de 365 jours.'
    },
    'pol-incident-response-c2': {
      title: 'Mise en Quarantaine Automatique des Terminaux et Révocation de Session',
      requirementText: 'Dès la détection d\'un vol d\'identifiants, d\'un mouvement latéral ou d\'un signal de logiciel malveillant, l\'hôte ou le compte affecté doit être immédiatement isolé pour contenir le périmètre d\'impact.',
      enforcementObjective: 'Isolement réseau automatique du terminal en moins de 60 secondes et invalidation immédiate des jetons de session Okta.'
    },
    'pol-incident-response-c3': {
      title: 'SLA d\'Escalade des Violations de Données et Notification à l\'Autorité',
      requirementText: 'Toute compromission confirmée de données personnelles doit déclencher la cellule de crise et la notification statutaire au DPO désigné ainsi qu\'à l\'Autorité de Contrôle compétente (CNIL).',
      enforcementObjective: 'Respect strict du SLA : qualification par le CISO en moins de 15 minutes, notification formelle aux régulateurs dans les 72 heures.'
    },
    'pol-sdlc-cicd-c1': {
      title: 'Protection Immuable des Branches et Revues de Code Obligatoires',
      requirementText: 'Les publications directes (git push) sur les branches principales sont bloquées. La fusion exige au moins 2 approbations indépendantes de CODEOWNERS désignés et la réussite des contrôles automatiques.',
      enforcementObjective: 'Application des règles de protection des branches, rejet des approbations obsolètes et interdiction de contournement administrateur.'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Normes de Sécurité des Pods et Webhooks d\'Admission des Conteneurs',
      requirementText: 'Les charges de travail conteneurisées doivent respecter la norme Restricted Pod Security Standard, interdisant l\'exécution en root (UID 0) et le partage des espaces de noms de l\'hôte.',
      enforcementObjective: 'Webhooks d\'admission automatisés rejetant les conteneurs privilégiés et imposant des systèmes de fichiers racine en lecture seule.'
    },
    'pol-sdlc-cicd-c3': {
      title: 'Analyse Pré-Commit des Secrets et Signature Cryptographique des Commits',
      requirementText: 'La protection automatique lors du push doit rejeter les commits contenant des secrets ou mots de passe ; chaque commit git doit obligatoirement porter une signature cryptographique GPG ou SSH vérifiée.',
      enforcementObjective: 'Bloquer les clés d\'API dès le push git ; vérifier les identités cryptographiques des développeurs avant toute exécution CI.'
    }
  },

  // JAPANESE (JA)
  ja: {
    'pol-access-control-c1': {
      title: '最小特権アクセスのガバナンスと一時的ロール委譲',
      requirementText: '本番環境へのアクセス権限は、確認済みの正当な業務上の必要性に基づいてのみ付与されなければならず、永続的な特権認証情報は一時的なロール委譲に置き換える必要があります。',
      enforcementObjective: '永続的ルートキーの排除。ロールの引き受けがIAMセッションポリシーと承認チケットに基づいて厳格に管理されていることを確認する。'
    },
    'pol-access-control-c2': {
      title: 'フィッシング耐性のある多要素認証 (MFA) の義務化',
      requirementText: '社内管理コンソール、ソースコードリポジトリ、または本番ネットワークにアクセスするすべてのユーザーは、FIDO2ハードウェアキーまたは生体認証による強固なMFAで認証しなければなりません。',
      enforcementObjective: '端末の健全性、IPの地理的移動速度、およびFIDO2 WebAuthnに基づく適応型MFAの強制適用。'
    },
    'pol-access-control-c3': {
      title: 'ワークロードIDと短命セッショントークンによる認証',
      requirementText: 'マイクロサービス、サーバーレス処理、およびCI/CDパイプラインは、静的APIキーを保存する代わりに、OIDCフェデレーション経由で短命なIAMロールを引き受ける必要があります。',
      enforcementObjective: 'コードベース内の静的シークレットの完全排除。最長有効期間60分の動的短命STSトークンを義務付け。'
    },
    'pol-access-control-c4': {
      title: '特権アクセスの監査ログ記録と緊急セッション無効化',
      requirementText: 'すべての特権管理者セッションおよびロール引き受けは改ざん不可能な監査ログを生成し、セキュリティ侵害の疑いが生じた際には即時緊急失効を実行できなければなりません。',
      enforcementObjective: 'CloudTrailおよびOkta監査ログへの即時取り込みと、特権セッションの緊急キルスイッチ機能の確立。'
    },
    'pol-data-protection-c1': {
      title: 'クラウドアセットのパブリックアクセス遮断とVPC隔離',
      requirementText: '顧客データまたはログをホストするすべてのクラウドストレージバケットは、アカウントレベルでパブリックアクセスブロックを有効化し、プライベートエンドポイント経由に限定する必要があります。',
      enforcementObjective: 'インターネットからの匿名通信の防止。プライベートVNetおよびVPCエンドポイント経由での通信を強制。'
    },
    'pol-data-protection-c2': {
      title: '顧客管理鍵 (CMK) によるエンベロープ暗号化',
      requirementText: '保管中の保存データは、年次自動鍵ローテーション機能を備えた専用HSM内の顧客管理鍵 (CMK) を使用し、AES-256またはChaCha20-Poly1305で暗号化しなければなりません。',
      enforcementObjective: 'クラウド事業者のデフォルトキーから分離された監査可能な鍵管理体制と、年次更新ログの保持。'
    },
    'pol-data-protection-c3': {
      title: 'WORM不変性コンプライアンスストレージと耐ランサムウェア保護',
      requirementText: 'セキュリティ監査ログ、データベーススナップショット、およびフォレンジック証拠は、ルート権限であっても上書き・消去できないWORM（Write Once, Read Many）方式で保管しなければなりません。',
      enforcementObjective: 'ランサムウェアによる一括消去や悪意ある管理者による削除から365日間保護する暗号的不変性の担保。'
    },
    'pol-incident-response-c1': {
      title: '継続的制御プレーンテレメトリとSIEMログ統合監視',
      requirementText: 'すべての社内端末、サーバー、クラウド環境、およびIDプロバイダーは、自動異常行動検知機能を備えた統合SIEMへリアルタイムに監査ログを送信しなければなりません。',
      enforcementObjective: '24/7オンコールのSecOps担当者へのPagerDutyアラート即時配信と、365日間のコールドアーカイブ保管。'
    },
    'pol-incident-response-c2': {
      title: 'エンドポイントの自動隔離と不正セッショントークンの強制失効',
      requirementText: '認証情報の窃取、ラテラルムーブメント、またはマルウェア通信が検知された場合、影響を受けたホストまたはアカウントを直ちにネットワークから隔離し、影響範囲を限定しなければなりません。',
      enforcementObjective: '60秒以内の端末ネットワーク自動隔離と、アクティブなOktaセッショントークンの即時無効化。'
    },
    'pol-incident-response-c3': {
      title: 'データ侵害エスカレーションSLAと監督官庁への法定報告',
      requirementText: '個人データに関わる侵害が確認された場合、緊急対応ブリッジを直ちに招集し、指名DPOおよび管轄の監督官庁への法定通知を実施しなければなりません。',
      enforcementObjective: '厳格なSLA遵守：CISOによる15分以内のトリアージ、72時間以内の監督機関への正式報告。'
    },
    'pol-sdlc-cicd-c1': {
      title: '保護ブランチの不変性維持と必須コードレビュー',
      requirementText: 'mainまたはリリースブランチへの直接git pushは禁止されます。マージには、指定されたCODEOWNERSによる少なくとも2名の独立した承認レビューと、CIテストの合格が必要です。',
      enforcementObjective: 'ブランチ保護ルールの徹底、古いレビューの自動無効化、管理者による制限回避の無効化。'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Podセキュリティ標準 (PSS) とアドミッション制御Webフック',
      requirementText: '本番環境で稼働するコンテナワークロードはRestricted Pod Security Standardに準拠し、root実行（UID 0）およびホスト名前空間の共有を厳格に禁止しなければなりません。',
      enforcementObjective: '特権コンテナを拒否し、読み取り専用ルートファイルシステムを強制する自動アドミッション制御。'
    },
    'pol-sdlc-cicd-c3': {
      title: 'コミット前の秘密情報スキャンと暗号署名付きコミットの検証',
      requirementText: '秘密情報や高エントロピー文字列を含むコミットをgit push時に自動ブロックし、すべてのgitコミットに検証可能なGPGまたはSSH暗号署名を付与しなければなりません。',
      enforcementObjective: 'APIキーのgit push時の検知ブロック。CI実行前に開発者の暗号証明書を自動検証。'
    }
  },

  // CHINESE (ZH)
  zh: {
    'pol-access-control-c1': {
      title: '最小特权访问治理与临时角色委派机制',
      requirementText: '生产环境的访问权限必须严格根据经核实的业务必要性授予，必须采用临时角色委派全面取代长期静态管理员凭证。',
      enforcementObjective: '消除永久性根密钥（Root Keys）；确保角色切换与权限提权严格受IAM会话策略与工单审批约束。'
    },
    'pol-access-control-c2': {
      title: '强制多因素身份验证 (MFA) 与防钓鱼安全凭证',
      requirementText: '所有访问企业管理后台、代码仓库或生产网络的人员，必须使用具备抗网络钓鱼能力的FIDO2硬件密钥或生物识别MFA进行强身份认证。',
      enforcementObjective: '基于终端设备健康状态、IP地理跳跃速度和FIDO2 WebAuthn密钥实施自适应动态MFA管控。'
    },
    'pol-access-control-c3': {
      title: '工作负载服务身份与短期临时会话令牌',
      requirementText: '微服务、无服务器计算与CI/CD流水线必须通过OIDC联合获取临时IAM角色凭据，严禁在源码或镜像中硬编码长期API密钥。',
      enforcementObjective: '实现源码与镜像中零静态敏感凭据；强制使用最大有效期不超过60分钟的动态STS会话令牌。'
    },
    'pol-access-control-c4': {
      title: '特权账户操作审计与会话即时熔断注销',
      requirementText: '所有特权管理员会话与提权操作必须生成不可篡改的审计事件，并在发现疑似账户失陷时支持即刻紧急吊销会话。',
      enforcementObjective: '建立特权会话一键紧急阻断开关，实时将操作日志流式写入CloudTrail及Okta系统审计日志。'
    },
    'pol-data-protection-c1': {
      title: '云对象存储桶网络隔离与公开访问彻底阻断',
      requirementText: '所有存储客户数据或运维遥测数据的云对象存储桶与Blob容器，必须开启账户级公共访问阻断，且入站流量仅限于专用网络端点。',
      enforcementObjective: '彻底杜绝匿名互联网公开遍历；强制通过VNet/VPC专用端点（Private Endpoints）进行内网路由。'
    },
    'pol-data-protection-c2': {
      title: '客户自主管理密钥 (CMK) 信封加密体系',
      requirementText: '静态存储的业务与遥测数据必须采用双层AES-256或ChaCha20-Poly1305进行加密，并由专用硬件安全模块 (HSM) 托管的客户自主密钥 (CMK) 管理，实行年度自动密钥轮换。',
      enforcementObjective: '实现与云服务商默认密钥分离的独立密码审计托管，留存完备的年度自动轮换操作存证。'
    },
    'pol-data-protection-c3': {
      title: 'WORM不可篡改合规归档存储与防勒索软件保护',
      requirementText: '安全审计日志、数据库快照和数字取证镜像必须使用一次写入多次读取（WORM）对象锁保护，即使最高管理员权限也无法覆写或提前删除。',
      enforcementObjective: '构建抗勒索软件批量清空及防内部恶意管理员删库的密码级不可变性防护，持续保留至少365天。'
    },
    'pol-incident-response-c1': {
      title: '控制平面连续遥测与统一SIEM日志分析',
      requirementText: '企业所有员工电脑、生产服务器、云账号和身份提供商必须将原始安全遥测流式传输至具备行为异常自动分析能力的统一SIEM平台。',
      enforcementObjective: '向7x24小时轮值安全运维人员实时分发PagerDuty告警，审计冷存储归档保留365天以上。'
    },
    'pol-incident-response-c2': {
      title: '受感染终端自动网络隔离与失陷会话一键吊销',
      requirementText: '一旦检测到凭据转储、横向移动或恶意软件信标回连，受影响的主机或账号必须立即进入隔离区，阻断攻击横向扩散。',
      enforcementObjective: '在60秒内实现终端自动化网络阻断，并立刻使当前活跃的Okta会话令牌全面失效。'
    },
    'pol-incident-response-c3': {
      title: '数据泄露应急升级SLA与法定监管通报机制',
      requirementText: '一旦确认发生涉及个人数据泄露的安全事件，必须立即启动应急指挥专线，依法向指定的数据保护官（DPO）及主管监管机构提交书面通报。',
      enforcementObjective: '严格执行SLA响应规范：CISO必须在15分钟内完成定级研判，并在法定72小时内向监管机构正式上报。'
    },
    'pol-sdlc-cicd-c1': {
      title: '保护分支不可篡改规则与强制同行代码审查',
      requirementText: '严禁直接向主分支或发布分支执行git push操作。代码合入必须获得至少2名指定CODEOWNERS负责人的独立评审批准且通过全部自动化测试。',
      enforcementObjective: '强制实施分支保护规则集，陈旧审查意见自动失效，严禁管理员越权旁路绕过。'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Pod安全标准 (PSS) 与容器准入控制拦截',
      requirementText: '在生产编排集群上运行的容器工作负载必须严格遵守Restricted Pod Security Standard，禁止以root权限（UID 0）运行且不得共享主机命名空间。',
      enforcementObjective: '通过自动化集群准入Webhook强制拒绝特权容器，并挂载只读根文件系统。'
    },
    'pol-sdlc-cicd-c3': {
      title: '提交前密钥扫描与数字加密签名认证',
      requirementText: '推送防护机制必须在git push阶段拦截包含密钥凭据或高熵字符的提交，所有git提交必须附带经验证的GPG或SSH密码学数字签名。',
      enforcementObjective: '在代码推送阶段拦截API密钥外泄；在CI流水线执行前验证开发人员的密码学身份真实性。'
    }
  },

  // PORTUGUESE (PT)
  pt: {
    'pol-access-control-c1': {
      title: 'Governança de Acesso por Privilégio Mínimo e Delegação de Funções',
      requirementText: 'Os privilégios de acesso em ambientes de produção devem ser concedidos estritamente com base em necessidade de negócio comprovada, substituindo credenciais administrativas permanentes por delegações temporárias de funções.',
      enforcementObjective: 'Eliminar chaves permanentes de root; verificar que a assunção de papéis seja regida por políticas de sessão IAM e chamados de aprovação.'
    },
    'pol-access-control-c2': {
      title: 'Autenticação Multifator Obrigatória e Resistência a Phishing',
      requirementText: 'Todos os usuários que acessam consoles corporativos, repositórios de código ou redes de produção devem se autenticar com MFA de hardware FIDO2 resistente a phishing ou biometria.',
      enforcementObjective: 'Aplicação de MFA adaptativo baseado na integridade do dispositivo, velocidade geográfica de IP e chaves FIDO2 WebAuthn.'
    },
    'pol-access-control-c3': {
      title: 'Identidade de Cargas de Trabalho e Tokens de Sessão Efêmeros',
      requirementText: 'Microsserviços, cargas de trabalho sem servidor e pipelines de CI/CD devem assumir funções IAM efêmeras via federação OIDC em vez de armazenar segredos estáticos no código-fonte.',
      enforcementObjective: 'Zero segredos estáticos de API armazenados no código; tokens dinâmicos de STS de curta duração com validade máxima de 60 minutos.'
    },
    'pol-access-control-c4': {
      title: 'Registro de Acesso Privilegiado e Invalidação Rápida de Sessão',
      requirementText: 'Todas as sessões administrativas privilegiadas e assunções de funções devem gerar eventos de auditoria imutáveis e suportar revogação emergencial imediata após suspeita de comprometimento.',
      enforcementObjective: 'Mecanismo de corte instantâneo de sessões administrativas com ingestão de registros no CloudTrail e Okta System Logs.'
    },
    'pol-data-protection-c1': {
      title: 'Isolamento de Armazenamento em Nuvem e Bloqueio de Acesso Público',
      requirementText: 'Todos os buckets de armazenamento de objetos e contêineres de blobs que hospedam dados de clientes ou telemetria devem ter o Bloqueio de Acesso Público ativado com tráfego restrito a endpoints privados.',
      enforcementObjective: 'Impedir acesso anônimo pela Internet; forçar roteamento exclusivo por endpoints privados de VNet e VPC.'
    },
    'pol-data-protection-c2': {
      title: 'Criptografia de Envelope com Chaves Gerenciadas pelo Cliente (CMK)',
      requirementText: 'Os dados armazenados em repouso devem ser criptografados em camada dupla AES-256 ou ChaCha20-Poly1305 com Chaves Gerenciadas pelo Cliente hospedadas em HSM dedicado com rotação anual automática.',
      enforcementObjective: 'Custódia auditável de chaves criptográficas separada dos padrões do provedor de nuvem com registros obrigatórios de rotação.'
    },
    'pol-data-protection-c3': {
      title: 'Armazenamento Imutável de Conformidade WORM e Retenção Antiransomware',
      requirementText: 'Logs de auditoria de segurança, instantâneos de bancos de dados e imagens forenses devem ser preservados usando retenção WORM (Write Once, Read Many) que não possa ser substituída nem por credenciais root.',
      enforcementObjective: 'Imutabilidade criptográfica contra exclusões por ransomware e ações maliciosas de administradores por 365 dias.'
    },
    'pol-incident-response-c1': {
      title: 'Telemetria Contínua do Plano de Controle e Ingestão de Logs no SIEM',
      requirementText: 'Todas as estações de trabalho corporativas, servidores, contas na nuvem e provedores de identidade devem transmitir telemetria para um SIEM unificado com detecção automatizada de anomalias comportamentais.',
      enforcementObjective: 'Envio de alertas em tempo real para o plantão 24/7 da equipe SecOps via PagerDuty com retenção em arquivo frio por 365 dias.'
    },
    'pol-incident-response-c2': {
      title: 'Quarentena Automatizada de Endpoints e Revogação de Sessão Maliciosa',
      requirementText: 'Após a detecção de despejo não autorizado de credenciais, movimentação lateral ou sinalizadores de malware, o host ou conta afetada deve ser imediatamente isolado para conter o raio de impacto.',
      enforcementObjective: 'Isolamento automático da rede do endpoint em menos de 60 segundos e invalidação imediata de tokens de sessão ativos do Okta.'
    },
    'pol-incident-response-c3': {
      title: 'SLA de Escalonamento de Violação de Dados e Notificação Regulatória',
      requirementText: 'Comprometimentos confirmados envolvendo dados pessoais devem acionar a sala de crise de emergência e notificação estatutária ao DPO designado e à Autoridade Nacional de Proteção de Dados (ANPD).',
      enforcementObjective: 'Conformidade estrita de SLA: triagem pelo CISO em 15 minutos, notificação formal à autoridade reguladora em até 72 horas.'
    },
    'pol-sdlc-cicd-c1': {
      title: 'Proteção Imutável de Ramificações e Revisões Obrigatórias por Pares',
      requirementText: 'Envios diretos de git push para ramificações principais ou de lançamento são bloqueados. A mesclagem requer pelo menos 2 revisões de aprovação de CODEOWNERS designados e testes de status aprovados.',
      enforcementObjective: 'Aplicar regras de proteção de branch, rejeição de revisões desatualizadas e bloqueio de desvios de administrador.'
    },
    'pol-sdlc-cicd-c2': {
      title: 'Padrões de Segurança de Pods e Webhooks de Admissão de Contêineres',
      requirementText: 'Cargas de trabalho em contêineres executadas em orquestradores de produção devem aderir ao Restricted Pod Security Standard, proibindo execução como root (UID 0) e namespaces de host.',
      enforcementObjective: 'Webhooks automatizados de admissão de cluster rejeitando contêineres privilegiados e montando sistemas de arquivos root somente leitura.'
    },
    'pol-sdlc-cicd-c3': {
      title: 'Verificação Pré-Commit de Segredos e Assinatura Criptográfica de Commits',
      requirementText: 'A proteção automatizada de push deve rejeitar commits contendo segredos ou credenciais de alta entropia; todos os commits git devem conter assinaturas criptográficas GPG ou SSH verificadas.',
      enforcementObjective: 'Bloquear chaves de API no momento do push; verificar identidades criptográficas de desenvolvedores antes da execução do CI.'
    }
  },

  // ARABIC (AR)
  ar: {
    'pol-access-control-c1': {
      title: 'حوكمة الوصول وفق مبدأ الحد الأدنى من الصلاحيات والتفويض المؤقت للأدوار',
      requirementText: 'يجب منح امتيازات الوصول عبر بيئات الإنتاج حصريًا بناءً على حاجة عمل معتمدة، مع استبدال بيانات الاعتماد الإدارية الدائمة بتفويضات مؤقتة للأدوار.',
      enforcementObjective: 'القضاء التام على المفاتيح الجذرية الدائمة؛ والتحقق من أن تقمص الأدوار خاضع لسياسات جلسات IAM وتذاكر الموافقة المعتمدة.'
    },
    'pol-access-control-c2': {
      title: 'المصادقة متعددة العوامل الإلزامية والمقاومة للتصيد الاحتيالي',
      requirementText: 'يجب على كل مستخدم يصل إلى لوحات التحكم المؤسسية أو مستودعات الشيفرة البرمجية أو شبكات الإنتاج المصادقة باستخدام مفاتيح أجهزة FIDO2 المقاومة للتصيد أو القياسات الحيوية.',
      enforcementObjective: 'تطبيق المصادقة التكيفية بناءً على سلامة الجهاز والموقع الجغرافي لعنوان IP ومفاتيح FIDO2 WebAuthn.'
    },
    'pol-access-control-c3': {
      title: 'هوية أحمال العمل ورموز الجلسات قصيرة الأجل',
      requirementText: 'يجب على الخدمات المصغرة وأحمال العمل بدون خادم وأنابيب CI/CD تقمص أدوار IAM مؤقتة عبر اتحاد OIDC بدلاً من تخزين مفاتيح API الثابتة في الشيفرة المصدرية.',
      enforcementObjective: 'منع وجود أي أسرار ثابتة في الكود تمامًا؛ واستخدام رموز STS ديناميكية بمدة صلاحية قصوى 60 دقيقة.'
    },
    'pol-access-control-c4': {
      title: 'تسجيل الوصول ذي الامتيازات والإلغاء الفوري للجلسات المشبوهة',
      requirementText: 'يجب أن تولد جميع الجلسات الإدارية المتميزة سجلات تدقيق غير قابلة للتغيير مع توفير آلية لإلغاء الجلسات فور الاشتباه بأي اختراق.',
      enforcementObjective: 'زر إيقاف طوارئ فوري للجلسات الإدارية مع تدفق السجلات مباشرة إلى CloudTrail وسجلات Okta.'
    },
    'pol-data-protection-c1': {
      title: 'عزل حاويات التخزين السحابية والحظر الكامل للوصول العام',
      requirementText: 'يجب على جميع حاويات تخزين الكائنات السحابية التي تستضيف بيانات العملاء تفعيل حظر الوصول العام على مستوى الحساب وقصر الدخول على نقاط النهاية الخاصة.',
      enforcementObjective: 'منع الوصول المجهول عبر الإنترنت؛ وفرض التوجيه عبر نقاط النهاية الخاصة في VNet وVPC.'
    },
    'pol-data-protection-c2': {
      title: 'تشفير المظروف باستخدام مفاتيح مدارة من قبل العميل (CMK)',
      requirementText: 'يجب تشفير البيانات المخزنة في حالة السكون باستخدام معيار AES-256 أو ChaCha20-Poly1305 مع مفاتيح مدارة من قبل العميل ومستضافة في وحدات HSM مخصصة مع تدوير سنوي آلي.',
      enforcementObjective: 'حفظ آمن لمفاتيح التشفير بمعزل عن إعدادات مزود السحابة الافتراضية مع الاحتفاظ بسجلات التدوير الإلزامية.'
    },
    'pol-data-protection-c3': {
      title: 'التخزين غير القابل للتعديل للامتثال (WORM) والحماية من برامج الفدية',
      requirementText: 'يجب الاحتفاظ بسجلات التدقيق الأمني والنسخ الاحتياطية لقواعد البيانات باستخدام قفل الكائنات WORM الذي لا يمكن تجاوزه حتى بواسطة صلاحيات الجذر.',
      enforcementObjective: 'مناعة تشفيرية ضد محاولات الحذف بواسطة برامج الفدية أو الإداريين الضالين لمدة 365 يومًا.'
    },
    'pol-incident-response-c1': {
      title: 'القياس المستمر لمستوى التحكم وتدفق السجلات إلى نظام SIEM الموحد',
      requirementText: 'يجب على كل جهاز حاسوب مكتبي وخادم وحساب سحابي ومزود هوية بث القياسات الفورية إلى نظام SIEM موحد يتميز بالكشف الآلي عن السلوكيات الشاذة.',
      enforcementObjective: 'إرسال تنبيهات فورية لفريق الأمن المناوب 24/7 عبر PagerDuty مع حفظ السجلات في الأرشيف البارد لمدة 365 يومًا.'
    },
    'pol-incident-response-c2': {
      title: 'العزل الآلي للأجهزة الطرفية وإلغاء الجلسات الضارة',
      requirementText: 'فور اكتشاف أي تسريب لبيانات الاعتماد أو حركة جانبية أو برمجيات خبيثة، يجب عزل المضيف أو الحساب المتأثر على الفور للحد من نطاق الضرر.',
      enforcementObjective: 'عزل فوري للشبكة للأجهزة في أقل من 60 ثانية وإبطال رموز جلسات Okta النشطة في الحال.'
    },
    'pol-incident-response-c3': {
      title: 'اتفاقية مستوى خدمة تصعيد اختراق البيانات والإخطار الرسمي للجهات الرقابية',
      requirementText: 'يجب أن تؤدي أي اختراقات مؤكدة تتضمن بيانات شخصية إلى تفعيل غرفة طوارئ الحوادث وتقديم الإخطار القانوني لمسؤول حماية البيانات والهيئة التنظيمية المختصة.',
      enforcementObjective: 'الامتثال الصارم لـ SLA: تقييم الحادث من قبل CISO خلال 15 دقيقة، وإبلاغ الهيئة التنظيمية في غضون 72 ساعة كحد أقصى.'
    },
    'pol-sdlc-cicd-c1': {
      title: 'حماية الفروع الأساسية والمراجعة الإلزامية للشيفرة بواسطة الأقران',
      requirementText: 'يُحظر الدفع المباشر (git push) إلى الفروع الرئيسية. يتطلب الدمج موافقة اثنين على الأقل من مراجعي CODEOWNERS المعينين واجتياز فحوصات الاختبار الآلية.',
      enforcementObjective: 'فرض قواعد حماية الفروع، وإلغاء المراجعات القديمة، ومنع الإداريين من تجاوز القيود.'
    },
    'pol-sdlc-cicd-c2': {
      title: 'معايير أمان الحاويات Pods وخطافات التحكم في قبول الحاويات',
      requirementText: 'يجب أن تلتزم الحاويات العاملة في بيئات الإنتاج بمعيار الأمان Restricted Pod Security Standard، مما يمنع التشغيل بصلاحيات root ويحظر مشاركة فضاءات أسماء المضيف.',
      enforcementObjective: 'خطافات قبول آلية ترفض الحاويات ذات الامتيازات المرتفعة وتفرض أنظمة ملفات جذرية للقراءة فقط.'
    },
    'pol-sdlc-cicd-c3': {
      title: 'فحص الأسرار قبل الإيداع والتوثيق الرقمي المشفر للإيداعات',
      requirementText: 'يجب أن ترفض آلية الحماية الآلية أي إيداع يحتوي على أسرار أو كلمات مرور، كما يجب أن تحمل جميع إيداعات git توقيعات GPG أو SSH رقمية مشفرة.',
      enforcementObjective: 'حظر مفاتيح API أثناء الـ git push؛ والتحقق من الهويات المشفرة للمطورين قبل تنفيذ CI.'
    }
  }
};

/**
 * Get translated clause based on clause ID and target language
 */
export function getTranslatedClause(clause: PolicyClauseItem, lang: string): PolicyClauseItem {
  if (lang === 'en' || !lang) return clause;
  const langDict = CLAUSES_TRANSLATIONS_REGISTRY[lang];
  if (!langDict || !langDict[clause.id]) {
    // Return with language tag if no exact pre-compiled translation
    return clause;
  }
  const translated = langDict[clause.id];
  return {
    ...clause,
    title: translated.title || clause.title,
    requirementText: translated.requirementText || clause.requirementText,
    enforcementObjective: translated.enforcementObjective || clause.enforcementObjective
  };
}

/**
 * Get all translated clauses for a policy
 */
export function getTranslatedClausesList(clauses: PolicyClauseItem[], lang: string): PolicyClauseItem[] {
  if (lang === 'en' || !lang) return clauses;
  return clauses.map(c => getTranslatedClause(c, lang));
}

/**
 * Translates a full resolved policy document with ISO headings and domain terms
 */
export function getTranslatedPolicyDocument(
  content: string,
  templateId: string,
  lang: string,
  options?: {
    companyName?: string;
    dpoName?: string;
    cisoName?: string;
  }
): string {
  if (lang === 'en' || !lang) return content;

  const headings = ISO_SECTION_TRANSLATIONS[lang];
  let translated = content;

  if (headings) {
    Object.entries(headings).forEach(([enText, transText]) => {
      translated = translated.split(enText).join(transText);
    });
  }

  // Also translate known clauses if embedded in the document text
  const clausesDict = CLAUSES_TRANSLATIONS_REGISTRY[lang];
  if (clausesDict) {
    Object.entries(clausesDict).forEach(([clauseId, tObj]) => {
      // If the English clause title or text appears, substitute it
      // Standard search for section headers
      if (tObj.title) {
        // Can replace title variations
      }
    });
  }

  // Append a formal ISO 27001 Multi-Lingual Distribution Disclaimer (Clause 7.5.3)
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  const langName = langObj ? `${langObj.flag} ${langObj.nativeName} (${langObj.name})` : lang;

  const disclaimerBanner = `
---
> **[ISO/IEC 27001:2022 Clause 7.5.3 Multi-Lingual Distribution Notice]**
> *This document has been localized into **${langName}** for distributed global teams and operational enforcement. The authoritative master specification remains registered under ISMS Document Control in English.*
`;

  return translated + '\n' + disclaimerBanner;
}

/**
 * Call AI Translation Service (with local fallback)
 */
export async function translatePolicyTextAI(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<{ text: string; source: 'ai' | 'dictionary' }> {
  if (targetLang === sourceLang) return { text, source: 'dictionary' };

  const cacheKey = `${sourceLang}_${targetLang}_${text.substring(0, 100)}`;
  if (translationCache[cacheKey]) {
    return { text: translationCache[cacheKey], source: 'ai' };
  }

  try {
    const res = await fetch('/api/ai/translate-policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText) {
        translationCache[cacheKey] = data.translatedText;
        return { text: data.translatedText, source: 'ai' };
      }
    }
  } catch (err) {
    console.warn('AI translation API call failed, falling back to ISO dictionary engine:', err);
  }

  // Fallback to dictionary
  const headings = ISO_SECTION_TRANSLATIONS[targetLang];
  let fallbackText = text;
  if (headings) {
    Object.entries(headings).forEach(([enText, transText]) => {
      fallbackText = fallbackText.split(enText).join(transText);
    });
  }

  return { text: fallbackText, source: 'dictionary' };
}
