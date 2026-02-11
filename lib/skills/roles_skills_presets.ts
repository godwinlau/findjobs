// role_skill_presets.ts
// Bigmovv Role-Based Skill Bundles for Onboarding
// When a candidate selects their role, suggest these skills automatically.
// All IDs reference skills_ontology.ts SkillNode.id values.

export interface RolePreset {
    id: string;
    label: string;
    description: string;
    category: RoleCategory;
    /** Skills auto-selected when user picks this role */
    coreSkills: string[];
    /** Skills shown as suggestions (user can toggle on) */
    suggestedSkills: string[];
  }
  
  export type RoleCategory =
    | "design"
    | "development"
    | "ecommerce"
    | "marketing"
    | "sales"
    | "va_admin"
    | "bpo"
    | "content_media"
    | "finance"
    | "ops_pm";
  
  // ---------------------------------------------------------------------------
  // PRESETS
  // ---------------------------------------------------------------------------
  
  export const ROLE_SKILL_PRESETS: RolePreset[] = [
    // =========================================================================
    // DESIGN
    // =========================================================================
    {
      id: "product_designer",
      label: "Product Designer",
      description: "End-to-end UX/UI for web & mobile products",
      category: "design",
      coreSkills: [
        "ui_design",
        "ux_research",
        "wireframing",
        "prototyping",
        "design_systems",
        "interaction_design",
        "figma",
        "responsive_design",
      ],
      suggestedSkills: [
        "mobile_ui_design",
        "web_ui_design",
        "usability_testing",
        "user_interviews",
        "journey_mapping",
        "information_architecture",
        "design_handoff",
        "ux_copywriting",
        "design_tokens",
        "motion_design",
        "accessibility_design",
        "adobe_xd",
      ],
    },
    {
      id: "ui_designer",
      label: "UI Designer",
      description: "Visual & interface design for digital products",
      category: "design",
      coreSkills: [
        "ui_design",
        "visual_design",
        "figma",
        "responsive_design",
        "typography",
        "layout_composition",
        "design_systems",
      ],
      suggestedSkills: [
        "mobile_ui_design",
        "web_ui_design",
        "prototyping",
        "design_tokens",
        "motion_design",
        "design_handoff",
        "photoshop",
        "illustrator",
        "accessibility_design",
      ],
    },
    {
      id: "ux_researcher",
      label: "UX Researcher",
      description: "User research, testing & insights",
      category: "design",
      coreSkills: [
        "ux_research",
        "user_interviews",
        "usability_testing",
        "journey_mapping",
        "persona_development",
      ],
      suggestedSkills: [
        "information_architecture",
        "wireframing",
        "product_analytics",
        "figma",
        "competitive_analysis",
        "experiment_design",
      ],
    },
    {
      id: "graphic_designer",
      label: "Graphic Designer",
      description: "Visual design for digital & print",
      category: "design",
      coreSkills: [
        "graphic_design",
        "visual_design",
        "photoshop",
        "illustrator",
        "canva",
        "typography",
        "layout_composition",
      ],
      suggestedSkills: [
        "brand_identity_design",
        "logo_design",
        "print_design",
        "packaging_design",
        "indesign",
        "figma",
        "social_media_content",
        "thumbnail_design",
      ],
    },
    {
      id: "brand_designer",
      label: "Brand Designer",
      description: "Brand identity, guidelines & visual systems",
      category: "design",
      coreSkills: [
        "brand_identity_design",
        "logo_design",
        "visual_design",
        "typography",
        "illustrator",
        "photoshop",
      ],
      suggestedSkills: [
        "graphic_design",
        "print_design",
        "packaging_design",
        "figma",
        "canva",
        "indesign",
        "layout_composition",
      ],
    },
  
    // =========================================================================
    // DEVELOPMENT
    // =========================================================================
    {
      id: "frontend_developer",
      label: "Frontend Developer",
      description: "Building web interfaces with modern frameworks",
      category: "development",
      coreSkills: [
        "html",
        "css",
        "javascript",
        "typescript",
        "react",
        "tailwind_css",
        "git",
        "responsive_design",
      ],
      suggestedSkills: [
        "nextjs",
        "vuejs",
        "angular",
        "sass_scss",
        "shadcn_ui",
        "framer_motion",
        "frontend_performance_optimization",
        "seo_friendly_frontend",
        "unit_testing_frontend",
        "e2e_testing",
        "figma",
        "github",
        "vscode",
      ],
    },
    {
      id: "fullstack_developer",
      label: "Full-Stack Developer",
      description: "Frontend + backend web development",
      category: "development",
      coreSkills: [
        "html",
        "css",
        "javascript",
        "typescript",
        "react",
        "nodejs",
        "rest_api_design",
        "postgresql",
        "git",
      ],
      suggestedSkills: [
        "nextjs",
        "expressjs",
        "graphql",
        "mongodb",
        "prisma",
        "supabase",
        "firebase",
        "docker",
        "aws",
        "vercel",
        "ci_cd",
        "tailwind_css",
        "database_design",
        "github",
      ],
    },
    {
      id: "backend_developer",
      label: "Backend Developer",
      description: "APIs, databases & server-side logic",
      category: "development",
      coreSkills: [
        "nodejs",
        "typescript",
        "rest_api_design",
        "database_design",
        "postgresql",
        "git",
      ],
      suggestedSkills: [
        "expressjs",
        "python",
        "django",
        "fastapi",
        "graphql",
        "mongodb",
        "mysql",
        "prisma",
        "docker",
        "aws",
        "ci_cd",
        "firebase",
        "supabase",
        "ruby_on_rails",
        "php",
      ],
    },
    {
      id: "mobile_developer",
      label: "Mobile Developer",
      description: "iOS, Android, or cross-platform apps",
      category: "development",
      coreSkills: [
        "react_native",
        "javascript",
        "typescript",
        "git",
      ],
      suggestedSkills: [
        "flutter",
        "ios_development",
        "swiftui",
        "android_development",
        "rest_api_design",
        "firebase",
        "supabase",
        "figma",
        "github",
      ],
    },
    {
      id: "ux_engineer",
      label: "UX Engineer / Design Engineer",
      description: "Bridging design and frontend implementation",
      category: "development",
      coreSkills: [
        "html",
        "css",
        "javascript",
        "react",
        "tailwind_css",
        "figma",
        "ui_design",
        "design_systems",
        "responsive_design",
      ],
      suggestedSkills: [
        "typescript",
        "nextjs",
        "framer_motion",
        "shadcn_ui",
        "prototyping",
        "design_tokens",
        "design_handoff",
        "accessibility_design",
        "frontend_performance_optimization",
        "motion_design",
        "git",
      ],
    },
    {
      id: "wordpress_developer",
      label: "WordPress Developer",
      description: "WordPress sites, themes & plugins",
      category: "development",
      coreSkills: [
        "wordpress",
        "html",
        "css",
        "javascript",
        "php",
      ],
      suggestedSkills: [
        "woocommerce",
        "seo",
        "responsive_design",
        "seo_friendly_frontend",
        "figma",
        "canva",
        "git",
      ],
    },
  
    // =========================================================================
    // ECOMMERCE / SHOPIFY
    // =========================================================================
    {
      id: "shopify_developer",
      label: "Shopify Developer",
      description: "Shopify themes, Liquid, store customization",
      category: "ecommerce",
      coreSkills: [
        "shopify_theme_development",
        "liquid",
        "shopify_online_store_2",
        "html",
        "css",
        "javascript",
      ],
      suggestedSkills: [
        "shopify_performance_optimization",
        "shopify_app_integration",
        "shopify_app_development",
        "shopify_plus",
        "tailwind_css",
        "ecommerce_ux",
        "checkout_optimization",
        "conversion_rate_optimization",
        "seo_friendly_frontend",
        "git",
        "figma",
      ],
    },
    {
      id: "ecommerce_manager",
      label: "E-commerce Manager",
      description: "Online store operations, CRO & growth",
      category: "ecommerce",
      coreSkills: [
        "ecommerce_ux",
        "conversion_rate_optimization",
        "checkout_optimization",
        "google_analytics",
        "seo",
      ],
      suggestedSkills: [
        "shopify_theme_development",
        "shopify_app_integration",
        "woocommerce",
        "facebook_ads",
        "google_ads",
        "email_marketing",
        "social_media_management",
        "product_analytics",
        "pixel_tracking",
      ],
    },
  
    // =========================================================================
    // MARKETING / ADS
    // =========================================================================
    {
      id: "facebook_ads_specialist",
      label: "Facebook / Meta Ads Specialist",
      description: "Paid social campaigns on Meta platforms",
      category: "marketing",
      coreSkills: [
        "facebook_ads",
        "meta_ads_manager",
        "audience_targeting",
        "pixel_tracking",
        "ad_reporting",
      ],
      suggestedSkills: [
        "ad_creative_testing",
        "retargeting_campaigns",
        "paid_social",
        "google_analytics",
        "conversion_rate_optimization",
        "canva",
        "copywriting",
        "tiktok_ads",
      ],
    },
    {
      id: "google_ads_specialist",
      label: "Google Ads Specialist",
      description: "PPC, search & display campaigns",
      category: "marketing",
      coreSkills: [
        "google_ads",
        "seo",
        "google_analytics",
        "pixel_tracking",
        "ad_reporting",
      ],
      suggestedSkills: [
        "audience_targeting",
        "retargeting_campaigns",
        "conversion_rate_optimization",
        "copywriting",
        "content_writing",
      ],
    },
    {
      id: "paid_media_specialist",
      label: "Paid Media Specialist",
      description: "Multi-platform ad campaigns",
      category: "marketing",
      coreSkills: [
        "facebook_ads",
        "google_ads",
        "paid_social",
        "pixel_tracking",
        "audience_targeting",
        "ad_reporting",
      ],
      suggestedSkills: [
        "tiktok_ads",
        "meta_ads_manager",
        "ad_creative_testing",
        "retargeting_campaigns",
        "google_analytics",
        "conversion_rate_optimization",
        "copywriting",
        "canva",
      ],
    },
    {
      id: "digital_marketing_specialist",
      label: "Digital Marketing Specialist",
      description: "Broad digital marketing across channels",
      category: "marketing",
      coreSkills: [
        "social_media_management",
        "email_marketing",
        "seo",
        "google_analytics",
        "content_writing",
      ],
      suggestedSkills: [
        "facebook_ads",
        "google_ads",
        "paid_social",
        "copywriting",
        "canva",
        "social_media_content",
        "influencer_marketing",
        "pixel_tracking",
        "blog_management",
      ],
    },
    {
      id: "social_media_manager",
      label: "Social Media Manager",
      description: "Content, scheduling & community management",
      category: "marketing",
      coreSkills: [
        "social_media_management",
        "social_media_content",
        "canva",
        "copywriting",
      ],
      suggestedSkills: [
        "facebook_ads",
        "content_writing",
        "video_editing",
        "capcut",
        "short_form_video",
        "thumbnail_design",
        "influencer_marketing",
        "google_analytics",
        "email_marketing",
      ],
    },
    {
      id: "seo_specialist",
      label: "SEO Specialist",
      description: "Search engine optimization & organic growth",
      category: "marketing",
      coreSkills: [
        "seo",
        "google_analytics",
        "content_writing",
        "seo_friendly_frontend",
      ],
      suggestedSkills: [
        "blog_management",
        "technical_writing",
        "wordpress",
        "copywriting",
        "google_ads",
        "competitive_analysis",
      ],
    },
  
    // =========================================================================
    // SALES / SDR
    // =========================================================================
    {
      id: "sdr",
      label: "Sales Development Representative (SDR)",
      description: "Outbound prospecting, cold outreach & qualification",
      category: "sales",
      coreSkills: [
        "cold_calling",
        "cold_email",
        "lead_generation",
        "sales_outreach",
        "qualification_calls",
        "crm_management",
      ],
      suggestedSkills: [
        "objection_handling",
        "pipeline_management",
        "sales_pitching",
        "appointment_setting",
        "b2b_sales",
        "hubspot",
        "salesforce",
        "linkedin",
      ],
    },
    {
      id: "appointment_setter",
      label: "Appointment Setter",
      description: "Booking meetings & qualifying leads",
      category: "sales",
      coreSkills: [
        "appointment_setting",
        "cold_calling",
        "lead_generation",
        "crm_management",
        "calendar_management",
      ],
      suggestedSkills: [
        "cold_email",
        "sales_outreach",
        "objection_handling",
        "qualification_calls",
        "replying_to_emails",
        "hubspot",
        "gohighlevel",
      ],
    },
    {
      id: "sales_closer",
      label: "Sales Closer / Account Executive",
      description: "Closing deals, demos & account management",
      category: "sales",
      coreSkills: [
        "sales_pitching",
        "objection_handling",
        "pipeline_management",
        "crm_management",
        "b2b_sales",
      ],
      suggestedSkills: [
        "qualification_calls",
        "account_management",
        "cold_calling",
        "cold_email",
        "lead_generation",
        "hubspot",
        "salesforce",
      ],
    },
  
    // =========================================================================
    // VA / ADMIN
    // =========================================================================
    {
      id: "general_virtual_assistant",
      label: "General Virtual Assistant",
      description: "Admin support, email, calendar & task management",
      category: "va_admin",
      coreSkills: [
        "email_management",
        "replying_to_emails",
        "calendar_management",
        "data_entry",
        "file_management",
        "google_workspace",
      ],
      suggestedSkills: [
        "document_preparation",
        "slide_deck_creation",
        "report_generation",
        "research_tasks",
        "travel_booking",
        "expense_tracking",
        "crm_updating",
        "microsoft_office",
        "notion",
        "slack",
        "zoom",
      ],
    },
    {
      id: "executive_assistant",
      label: "Executive Assistant",
      description: "High-level admin support for executives",
      category: "va_admin",
      coreSkills: [
        "email_management",
        "calendar_management",
        "replying_to_emails",
        "document_preparation",
        "slide_deck_creation",
        "travel_booking",
        "google_workspace",
      ],
      suggestedSkills: [
        "report_generation",
        "file_management",
        "expense_tracking",
        "research_tasks",
        "microsoft_office",
        "notion",
        "slack",
        "zoom",
        "data_entry",
      ],
    },
    {
      id: "customer_support_agent",
      label: "Customer Support Agent",
      description: "Email, chat & phone customer support",
      category: "va_admin",
      coreSkills: [
        "customer_support_email",
        "customer_support_chat",
        "replying_to_emails",
        "email_management",
      ],
      suggestedSkills: [
        "customer_support_phone",
        "crm_updating",
        "zendesk",
        "intercom",
        "freshdesk",
        "hubspot",
        "slack",
        "data_entry",
      ],
    },
    {
      id: "real_estate_va",
      label: "Real Estate Virtual Assistant",
      description: "Admin support for real estate professionals",
      category: "va_admin",
      coreSkills: [
        "email_management",
        "replying_to_emails",
        "calendar_management",
        "crm_updating",
        "data_entry",
        "lead_generation",
      ],
      suggestedSkills: [
        "appointment_scheduling_va",
        "document_preparation",
        "research_tasks",
        "social_media_management",
        "file_management",
        "google_workspace",
        "canva",
      ],
    },
  
    // =========================================================================
    // BPO
    // =========================================================================
    {
      id: "call_center_agent",
      label: "Call Center Agent",
      description: "Inbound/outbound call handling",
      category: "bpo",
      coreSkills: [
        "inbound_calls",
        "outbound_calls",
        "customer_support_phone",
      ],
      suggestedSkills: [
        "customer_support_email",
        "customer_support_chat",
        "crm_updating",
        "data_entry",
        "order_processing",
        "technical_support",
        "zendesk",
      ],
    },
    {
      id: "technical_support_agent",
      label: "Technical Support Agent",
      description: "IT helpdesk & tech troubleshooting",
      category: "bpo",
      coreSkills: [
        "technical_support",
        "inbound_calls",
        "customer_support_chat",
        "customer_support_email",
      ],
      suggestedSkills: [
        "outbound_calls",
        "crm_updating",
        "zendesk",
        "freshdesk",
        "data_entry",
        "order_processing",
      ],
    },
    {
      id: "transcriptionist",
      label: "Transcriptionist",
      description: "Audio/video transcription",
      category: "bpo",
      coreSkills: [
        "general_transcription",
        "data_entry",
      ],
      suggestedSkills: [
        "medical_transcription",
        "proofreading",
        "document_preparation",
        "google_workspace",
        "microsoft_office",
      ],
    },
    {
      id: "qa_analyst_bpo",
      label: "QA Analyst (BPO)",
      description: "Call quality monitoring & compliance",
      category: "bpo",
      coreSkills: [
        "quality_assurance_bpo",
        "report_generation",
      ],
      suggestedSkills: [
        "data_entry",
        "google_workspace",
        "microsoft_office",
        "inbound_calls",
      ],
    },
  
    // =========================================================================
    // CONTENT & MEDIA
    // =========================================================================
    {
      id: "content_writer",
      label: "Content Writer",
      description: "Blog posts, articles & web content",
      category: "content_media",
      coreSkills: [
        "content_writing",
        "copywriting",
        "seo",
        "blog_management",
      ],
      suggestedSkills: [
        "proofreading",
        "social_media_content",
        "ux_copywriting",
        "technical_writing",
        "script_writing",
        "wordpress",
        "google_workspace",
        "chatgpt",
      ],
    },
    {
      id: "copywriter",
      label: "Copywriter",
      description: "Sales copy, ads & landing pages",
      category: "content_media",
      coreSkills: [
        "copywriting",
        "content_writing",
        "seo",
      ],
      suggestedSkills: [
        "ux_copywriting",
        "email_marketing",
        "social_media_content",
        "ad_creative_testing",
        "proofreading",
        "blog_management",
        "google_workspace",
      ],
    },
    {
      id: "video_editor",
      label: "Video Editor",
      description: "Video production & post-production",
      category: "content_media",
      coreSkills: [
        "video_editing",
        "premiere_pro",
      ],
      suggestedSkills: [
        "after_effects",
        "davinci_resolve",
        "capcut",
        "final_cut_pro",
        "motion_design",
        "thumbnail_design",
        "short_form_video",
        "youtube_management",
        "podcast_editing",
      ],
    },
    {
      id: "short_form_video_editor",
      label: "Short-Form Video Editor",
      description: "Reels, TikToks, Shorts & vertical content",
      category: "content_media",
      coreSkills: [
        "short_form_video",
        "video_editing",
        "capcut",
      ],
      suggestedSkills: [
        "premiere_pro",
        "after_effects",
        "thumbnail_design",
        "social_media_content",
        "canva",
        "copywriting",
        "youtube_management",
      ],
    },
    {
      id: "podcast_editor_producer",
      label: "Podcast Editor / Producer",
      description: "Audio editing, show notes & publishing",
      category: "content_media",
      coreSkills: [
        "podcast_editing",
        "video_editing",
      ],
      suggestedSkills: [
        "content_writing",
        "social_media_content",
        "thumbnail_design",
        "youtube_management",
        "premiere_pro",
        "canva",
        "script_writing",
      ],
    },
    {
      id: "youtube_manager",
      label: "YouTube Manager",
      description: "Channel management, SEO & growth",
      category: "content_media",
      coreSkills: [
        "youtube_management",
        "video_editing",
        "thumbnail_design",
        "seo",
      ],
      suggestedSkills: [
        "short_form_video",
        "premiere_pro",
        "capcut",
        "canva",
        "social_media_content",
        "copywriting",
        "google_analytics",
        "script_writing",
      ],
    },
  
    // =========================================================================
    // FINANCE / ACCOUNTING
    // =========================================================================
    {
      id: "bookkeeper",
      label: "Bookkeeper",
      description: "Financial records, AP/AR & reconciliation",
      category: "finance",
      coreSkills: [
        "bookkeeping",
        "accounts_payable",
        "accounts_receivable",
        "quickbooks",
      ],
      suggestedSkills: [
        "xero",
        "payroll_processing",
        "financial_reporting",
        "expense_tracking",
        "tax_preparation",
        "microsoft_office",
        "google_workspace",
        "data_entry",
      ],
    },
    {
      id: "payroll_specialist",
      label: "Payroll Specialist",
      description: "Payroll processing & compliance",
      category: "finance",
      coreSkills: [
        "payroll_processing",
        "bookkeeping",
        "quickbooks",
      ],
      suggestedSkills: [
        "xero",
        "accounts_payable",
        "financial_reporting",
        "expense_tracking",
        "microsoft_office",
        "data_entry",
      ],
    },
  
    // =========================================================================
    // OPS / PROJECT MANAGEMENT
    // =========================================================================
    {
      id: "project_manager",
      label: "Project Manager",
      description: "Planning, execution & team coordination",
      category: "ops_pm",
      coreSkills: [
        "project_management",
        "agile_methodologies",
        "sprint_planning",
        "requirements_documentation",
        "risk_management",
      ],
      suggestedSkills: [
        "scrum_ceremonies",
        "kanban",
        "backlog_management",
        "stakeholder_alignment",
        "process_improvement",
        "jira",
        "asana",
        "clickup",
        "monday",
        "notion",
        "slack",
      ],
    },
    {
      id: "scrum_master",
      label: "Scrum Master",
      description: "Agile ceremonies, coaching & delivery",
      category: "ops_pm",
      coreSkills: [
        "scrum_ceremonies",
        "agile_methodologies",
        "sprint_planning",
        "kanban",
        "project_management",
      ],
      suggestedSkills: [
        "backlog_management",
        "risk_management",
        "process_improvement",
        "jira",
        "clickup",
        "linear",
        "notion",
      ],
    },
    {
      id: "product_manager",
      label: "Product Manager",
      description: "Product strategy, roadmap & execution",
      category: "ops_pm",
      coreSkills: [
        "product_strategy",
        "roadmap_planning",
        "feature_prioritization",
        "requirements_gathering",
        "user_story_writing",
        "product_analytics",
        "stakeholder_alignment",
      ],
      suggestedSkills: [
        "product_discovery",
        "mvp_definition",
        "kpi_definition",
        "experiment_design",
        "go_to_market_planning",
        "competitive_analysis",
        "backlog_management",
        "agile_methodologies",
        "jira",
        "notion",
        "figma",
      ],
    },
  ];
  
  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  
  /** Get all presets for a category */
  export function getPresetsByCategory(category: RoleCategory): RolePreset[] {
    return ROLE_SKILL_PRESETS.filter((p) => p.category === category);
  }
  
  /** Get a preset by ID */
  export function getPresetById(id: string): RolePreset | undefined {
    return ROLE_SKILL_PRESETS.find((p) => p.id === id);
  }
  
  /** Get all skill IDs (core + suggested) for a preset */
  export function getAllSkillIdsForPreset(presetId: string): string[] {
    const preset = getPresetById(presetId);
    if (!preset) return [];
    return [...new Set([...preset.coreSkills, ...preset.suggestedSkills])];
  }
  
  /** Get unique categories with labels */
  export function getRoleCategories(): { id: RoleCategory; label: string }[] {
    return [
      { id: "design", label: "Design" },
      { id: "development", label: "Development" },
      { id: "ecommerce", label: "E-commerce" },
      { id: "marketing", label: "Marketing & Ads" },
      { id: "sales", label: "Sales & SDR" },
      { id: "va_admin", label: "Virtual Assistant & Admin" },
      { id: "bpo", label: "BPO & Support" },
      { id: "content_media", label: "Content & Media" },
      { id: "finance", label: "Finance & Accounting" },
      { id: "ops_pm", label: "Operations & PM" },
    ];
  }
  
  /**
   * Search presets by query (matches label, description, category).
   * Useful for a role search/autocomplete in onboarding.
   */
  export function searchPresets(query: string): RolePreset[] {
    const q = query.toLowerCase().trim();
    if (!q) return ROLE_SKILL_PRESETS;
  
    return ROLE_SKILL_PRESETS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }