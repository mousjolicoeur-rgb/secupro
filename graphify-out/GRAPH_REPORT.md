# Graph Report - .  (2026-04-18)

## Corpus Check
- 119 files · ~74,461 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 544 nodes · 548 edges · 97 communities detected
- Extraction: 86% EXTRACTED · 13% INFERRED · 1% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.8)
- Token cost: 60,300 input · 7,100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Agent Workspace Pages|Agent Workspace Pages]]
- [[_COMMUNITY_Agent UI & Calendar|Agent UI & Calendar]]
- [[_COMMUNITY_Exploitation Dashboard|Exploitation Dashboard]]
- [[_COMMUNITY_API Backend Services|API Backend Services]]
- [[_COMMUNITY_Auth & Docs APIs|Auth & Docs APIs]]
- [[_COMMUNITY_Branding & Static Pages|Branding & Static Pages]]
- [[_COMMUNITY_Auth & Lead System|Auth & Lead System]]
- [[_COMMUNITY_Agent Session Management|Agent Session Management]]
- [[_COMMUNITY_AI Features & Business|AI Features & Business]]
- [[_COMMUNITY_Agent UI Components|Agent UI Components]]
- [[_COMMUNITY_Agent Activation & SEO|Agent Activation & SEO]]
- [[_COMMUNITY_Authentication Flow|Authentication Flow]]
- [[_COMMUNITY_Espace Pro Module|Espace Pro Module]]
- [[_COMMUNITY_Performance & Provisioning|Performance & Provisioning]]
- [[_COMMUNITY_Error Monitoring (Sentry)|Error Monitoring (Sentry)]]
- [[_COMMUNITY_Admin Panel|Admin Panel]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_News Feed Module|News Feed Module]]
- [[_COMMUNITY_Enterprise Portal Pages|Enterprise Portal Pages]]
- [[_COMMUNITY_Provisioning UI|Provisioning UI]]
- [[_COMMUNITY_Provisioning Upload|Provisioning Upload]]
- [[_COMMUNITY_Admin API Routes|Admin API Routes]]
- [[_COMMUNITY_App Layout & Branding|App Layout & Branding]]
- [[_COMMUNITY_Export Templates|Export Templates]]
- [[_COMMUNITY_Graph Visualization|Graph Visualization]]
- [[_COMMUNITY_Enterprise Activation|Enterprise Activation]]
- [[_COMMUNITY_News Feeds API|News Feeds API]]
- [[_COMMUNITY_AI Suggestions Panel|AI Suggestions Panel]]
- [[_COMMUNITY_Pro Profile Management|Pro Profile Management]]
- [[_COMMUNITY_Agent News Page|Agent News Page]]
- [[_COMMUNITY_Espace Pro Auth|Espace Pro Auth]]
- [[_COMMUNITY_Agent Support Page|Agent Support Page]]
- [[_COMMUNITY_Trial Banner|Trial Banner]]
- [[_COMMUNITY_Graph API & Viz|Graph API & Viz]]
- [[_COMMUNITY_Audit Visualization|Audit Visualization]]
- [[_COMMUNITY_Provisioning Interface|Provisioning Interface]]
- [[_COMMUNITY_Agent Profile Session|Agent Profile Session]]
- [[_COMMUNITY_Sitemap SEO|Sitemap SEO]]
- [[_COMMUNITY_Abonnement Page|Abonnement Page]]
- [[_COMMUNITY_Agent Home Page|Agent Home Page]]
- [[_COMMUNITY_Agent Activate Page|Agent Activate Page]]
- [[_COMMUNITY_Agent Code Page|Agent Code Page]]
- [[_COMMUNITY_Agent Hub|Agent Hub]]
- [[_COMMUNITY_Agent Mission Page|Agent Mission Page]]
- [[_COMMUNITY_Agents Overview|Agents Overview]]
- [[_COMMUNITY_Agents List|Agents List]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Main Dashboard|Main Dashboard]]
- [[_COMMUNITY_Map Radar Component|Map Radar Component]]
- [[_COMMUNITY_Enterprise Support|Enterprise Support]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_Maintenance Page|Maintenance Page]]
- [[_COMMUNITY_Performance Page|Performance Page]]
- [[_COMMUNITY_Provisioning Page|Provisioning Page]]
- [[_COMMUNITY_Provisioning Interface Page|Provisioning Interface Page]]
- [[_COMMUNITY_Register Page|Register Page]]
- [[_COMMUNITY_Verrou Tactique|Verrou Tactique]]
- [[_COMMUNITY_Dashboard Header|Dashboard Header]]
- [[_COMMUNITY_Performance Dashboard|Performance Dashboard]]
- [[_COMMUNITY_Schedule Grid|Schedule Grid]]
- [[_COMMUNITY_Auth Client|Auth Client]]
- [[_COMMUNITY_Auth Guard|Auth Guard]]
- [[_COMMUNITY_SecuPRO App Agent|SecuPRO App Agent]]
- [[_COMMUNITY_Agent Lead Service|Agent Lead Service]]
- [[_COMMUNITY_Agents Dashboard|Agents Dashboard]]
- [[_COMMUNITY_Performance Page Component|Performance Page Component]]
- [[_COMMUNITY_Live Feed & Schedule|Live Feed & Schedule]]
- [[_COMMUNITY_Instrumentation Client|Instrumentation Client]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Sentry Client Config|Sentry Client Config]]
- [[_COMMUNITY_Sentry Edge Config|Sentry Edge Config]]
- [[_COMMUNITY_Sentry Server Config|Sentry Server Config]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_CGV Page|CGV Page]]
- [[_COMMUNITY_Legal Mentions|Legal Mentions]]
- [[_COMMUNITY_Success Page|Success Page]]
- [[_COMMUNITY_Agent Landing|Agent Landing]]
- [[_COMMUNITY_Agent Top Bar|Agent Top Bar]]
- [[_COMMUNITY_Footer|Footer]]
- [[_COMMUNITY_Graph Viz Component|Graph Viz Component]]
- [[_COMMUNITY_AI Panel Component|AI Panel Component]]
- [[_COMMUNITY_KPI Card Component|KPI Card Component]]
- [[_COMMUNITY_Live Feed Component|Live Feed Component]]
- [[_COMMUNITY_Provisioning JSX|Provisioning JSX]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_SecuApp Next Env|SecuApp Next Env]]
- [[_COMMUNITY_Agent Droits Page|Agent Droits Page]]
- [[_COMMUNITY_SecuApp Supabase|SecuApp Supabase]]
- [[_COMMUNITY_Router Transition|Router Transition]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Maintenance Component|Maintenance Component]]
- [[_COMMUNITY_Lead Flag Check|Lead Flag Check]]
- [[_COMMUNITY_Lead Flag Clear|Lead Flag Clear]]
- [[_COMMUNITY_SecuApp Next Env Alt|SecuApp Next Env Alt]]
- [[_COMMUNITY_Login Toggle|Login Toggle]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 15 edges
2. `AgentProfilPage` - 14 edges
3. `DocsPage` - 11 edges
4. `GET()` - 10 edges
5. `AgentHubPage` - 10 edges
6. `Dashboard Exploitation page` - 10 edges
7. `EspaceProPage` - 9 edges
8. `SecuAIPage` - 8 edges
9. `Page: /dashboard-exploitation` - 8 edges
10. `ProListingPage` - 8 edges

## Surprising Connections (you probably didn't know these)
- `createRapport()` --semantically_similar_to--> `sendMissionSignal()`  [AMBIGUOUS] [semantically similar]
  services\rapportService.ts → services\signalService.ts
- `Header (dashboard)` --conceptually_related_to--> `API /api/admin/profiles`  [AMBIGUOUS]
  components/dashboard/header.tsx → app/api/admin/profiles/route.ts
- `supabase (secupro-app client)` --semantically_similar_to--> `supabase (main client)`  [INFERRED] [semantically similar]
  secupro-app/lib/supabaseClient.ts → lib/supabaseClient.ts
- `Dashboard Exploitation page` --conceptually_related_to--> `Brand color: neon cyan #00d1ff`  [INFERRED]
  netlify-prod/dashboard.html → public/secupro-logo.svg
- `SecuPRO landing page (index.html)` --conceptually_related_to--> `Brand color: neon cyan #00d1ff`  [INFERRED]
  netlify-prod/index.html → public/secupro-logo.svg

## Hyperedges (group relationships)
- **Sentry init across client/server/edge runtimes** — instrumentation_client_sentryinit, sentry_edge_config_sentryinit, sentry_server_config_sentryinit [EXTRACTED 1.00]
- **Landing page dual entry points (Agent + Command Center)** — page_landingpage, concept_agent_space, concept_command_center [EXTRACTED 1.00]
- **Actualites news feed pipeline (page + API + types)** — agent_actualites_page_actualitespage, api_actualites_feeds_route, agent_actualites_channelpayload, agent_actualites_articlepayload [EXTRACTED 1.00]
- **Agent Auth Guard Pattern** — code_isauthenticatedclient, mission_missionpage, secuai_secuaipage, support_agentsupportpage, planning_agentplanningpage, code_agentcodepage [INFERRED 0.90]
- **Admin Cookie Auth Pattern** — adminlogin_route_post, adminlogout_route_post, adminleads_route_get, adminprofiles_route_get, adminprofiles_route_delete, gsc_route_get [INFERRED 0.95]
- **Agent Hub Navigation System** — hub_agenthubage, hub_hubtile, hub_tile, calendrier_calendrierpage, planning_agentplanningpage, paie_paiepage, docs_docspage, secuai_secuaipage, espropro_espacepropage, support_agentsupportpage [INFERRED 0.90]
- **Supabase Storage Document Upload Flow** — docs_docspage, docsupload_route_post, docsanalyze_route_post, paie_paiepage [INFERRED 0.80]
- **Espace Pro Session Management** — espropro_lockscreen, espropro_issessionvalid, espropro_savesession, espropro_clearsession, espropro_authsession [EXTRACTED 1.00]
- **AI-powered OCR/import pipeline (paie + planning)** — paie_ocr_route, planning_import_route, anthropic_claude_api, supabase_storage_payrolls, supabase_table_plannings [EXTRACTED 0.95]
- **Email notification system on new agent registration** — notify_new_lead_route, webhook_route, resend_email_service [EXTRACTED 0.90]
- **Authentication flow: login -> callback -> hub** — login_page, auth_callback_page, dashboard_layout, supabase_db [EXTRACTED 0.95]
- **Agent provisioning with audit trail** — provisioning_import_route, provisioning_audit_route, supabase_table_agents, supabase_table_import_audits [EXTRACTED 0.95]
- **Exploitation dashboard cluster (KPIs, planning, AI suggestions)** — dashboard_exploitation_page, header_component, kpicard_component, schedulegrid_component, aipanel_component, livefeed_component, planning_mensuel_page [INFERRED 0.85]
- **Enterprise portal: login, activation, dashboard, support** — espace_societe_page, espace_societe_activate_page, espace_societe_dashboard_page, espace_societe_support_page [INFERRED 0.85]
- **Performance analytics (agents, contracts, scores)** — performance_metrics_route, supabase_table_agents, supabase_table_contrats, supabase_table_performances, performance_dashboard_component [INFERRED 0.85]
- **Premium paywall enforcement group** — agentlanding_verrou, verroutableau_verroutableau, trialbanner_trialbanner, stripe_payment_link [INFERRED 0.85]
- **Admin API endpoints group** — api_admin_profiles, api_admin_login, api_admin_logout, pro_listing_page_prolistingpage [EXTRACTED 1.00]
- **Agent identity and session group** — agentavatar_agentavatar, agenttopbar_agenttopbar, agentactivation_agentactivation, lib_agentsession_agentsession [INFERRED 0.80]
- **Force graph visualization group** — graphvisualization_graphvisualization, dashboard_forcegraphcomponent_forcegraphcomponent, api_graph [INFERRED 0.80]
- **Authentication flow group** — register_page_registerpage, success_page_successpage, lib_supabaseclient_supabase, trialbanner_trialbanner [INFERRED 0.75]
- **Legal and footer navigation group** — mentions_legales_page_mentionslegalespage, footer_footer, success_page_successpage [EXTRACTED 1.00]
- **SecuPRO Agent Mobile Module** — secupro_app_agent_page, secupro_app_agent_hub_page, secupro_app_agent_docs_page, secupro_app_agent_droits_page, secupro_app_agent_paie_page, secupro_app_agent_planning_page [INFERRED 0.90]
- **Agent Provisioning Pipeline** — provisioning_interface_tsx_provisioninginterface, provisioning_upload_provisioningupload, provisioning_interface_jsx_provisioninginterface, api_provisioning_import, supabase_table_societes [INFERRED 0.85]
- **Supabase Auth Layer** — supabase_client_supabase, auth_client_isauthenticatedclient, auth_guard_getapprovalstatus, supabase_table_profiles [INFERRED 0.88]
- **Agent Session & Local Storage Management** — agent_session_agentprofile, agent_session_getagentprofile, agent_session_upsertagentprofile, agent_session_markagentleadcomplete, agent_session_hascompletedagentlead, agent_session_clearagenleadflags [EXTRACTED 1.00]
- **Dashboard Visualization Components** — kpi_card_kpicard, live_feed_livefeed, schedule_grid_schedulegrid, performance_dashboard_performancedashboard [INFERRED 0.82]
- **Mission signal pipeline: createRapport â†’ sendMissionSignal â†’ rapports table** — rapportservice_createrapport, signalservice_sendmissionsignal, signalservice_rapports_table [EXTRACTED 1.00]
- **Netlify static demo user flow: index â†’ login â†’ dashboard** — netlify_index_landing_page, netlify_login_auth_page, netlify_dashboard_dashboard_exploitation [EXTRACTED 1.00]
- **SecuPRO brand visual identity assets** — public_secupro_icon_svg, public_secupro_logo_svg, public_secupro_logo_official_png, brand_shield_cpu_motif, brand_color_cyan, brand_color_gold, brand_tagline [EXTRACTED 1.00]
- **Dashboard exploitation KPI set** — netlify_dashboard_kpi_sites_actifs, netlify_dashboard_kpi_agents_en_poste, netlify_dashboard_kpi_alertes_critiques, netlify_dashboard_kpi_masses_horaires [EXTRACTED 1.00]
- **Agent profile CRUD operations via Supabase profiles table** — pro_profile_profilepage, pro_profile_getprofile, pro_profile_handleupdate, pro_profile_profiles_table [EXTRACTED 1.00]

## Communities

### Community 0 - "Agent Workspace Pages"
Cohesion: 0.05
Nodes (23): cachedBlobUrl(), compressImage(), confirmDelete(), extractExpiry(), extractPdfText(), fetchDocs(), fetchFiches(), fetchVacations() (+15 more)

### Community 1 - "Agent UI & Calendar"
Cohesion: 0.06
Nodes (46): AgentsListe, CalendrierPage, RDV, RdvCard, POST (checkout), AgentActivation, AgentCodePage, isAuthenticatedClient (+38 more)

### Community 2 - "Exploitation Dashboard"
Cohesion: 0.08
Nodes (6): e(), exportPDF(), exportXLSX(), onDrop(), parseRapportXLSX(), processFile()

### Community 3 - "API Backend Services"
Cohesion: 0.08
Nodes (8): getISOWeek(), handle(), handleDelete(), handleDownload(), weekLabel(), dateOffset(), DELETE(), GET()

### Community 4 - "Auth & Docs APIs"
Cohesion: 0.09
Nodes (10): asString(), buildFromMeta(), compact(), saveProfile(), send(), unsub(), upsertProfile(), assertValidPDF() (+2 more)

### Community 5 - "Branding & Static Pages"
Cohesion: 0.1
Nodes (24): Brand color: neon cyan #00d1ff, Brand color: golden #f59e0b, Brand motif: shield + CPU chip (cyan-to-gold gradient), Brand tagline: SÃ‰CURITÃ‰ Â· INTELLIGENCE Â· PERFORMANCE, Command Center concept, Dashboard Exploitation page, KPI: Agents en Poste, KPI: Alertes Critiques (+16 more)

### Community 6 - "Auth & Lead System"
Cohesion: 0.12
Nodes (22): insertAgentLead, markAgentLeadComplete, isAuthenticatedClient, getApprovalStatus, Page: /dashboard, checkActivationCode, Component: MapRadar (Leaflet realtime map), Component: PerformanceDashboard (+14 more)

### Community 7 - "Agent Session Management"
Cohesion: 0.12
Nodes (12): onStorage(), clearAgentAvatar(), getAgentDisplayName(), getAgentProfile(), setAgentDisplayName(), upsertAgentProfile(), onClearAvatar(), createRapport() (+4 more)

### Community 8 - "AI Features & Business"
Cohesion: 0.11
Nodes (19): Component: AIPanel, Service: Anthropic Claude AI (claude-sonnet-4-6), Page: /business/connexion, Page: /cgv (Conditions GÃ©nÃ©rales de Vente), Page: /dashboard-exploitation, Page: /espace-societe/activate, Page: /espace-societe/dashboard (Chef d'Exploitation), Page: /espace-societe (login) (+11 more)

### Community 9 - "Agent UI Components"
Cohesion: 0.13
Nodes (18): AgentActivation, AgentAvatar, AgentLanding, Verrou (AgentLanding inline paywall), AgentTopBar, Header (dashboard), Footer, agentSession (lib) (+10 more)

### Community 10 - "Agent Activation & SEO"
Cohesion: 0.12
Nodes (16): ForcePage (abonnement test page), ActivatePage, PageAgent, Espace Agent â€” field security agent workspace, Command Center â€” business/society dashboard, Content Security Policy (CSP headers), SecuAI â€” AI operational assistant for security agents, Stripe payment (9.99â‚¬/mois) (+8 more)

### Community 11 - "Authentication Flow"
Cohesion: 0.17
Nodes (16): Page: /auth/callback, Page: /boss-admin-portal, Layout: /dashboard (auth guard), Page: /login, API: POST /api/notify/new-lead, API: GET /api/performance-metrics, API: GET /api/provisioning/audit/[auditId], API: POST /api/provisioning/import-full (+8 more)

### Community 12 - "Espace Pro Module"
Cohesion: 0.23
Nodes (12): AlertData, AuthInput, AuthSession, clearSession, EspaceProPage, FingerprintIcon, isSessionValid, LockScreen (+4 more)

### Community 13 - "Performance & Provisioning"
Cohesion: 0.22
Nodes (11): API /api/performance-metrics, API /api/provisioning/audit/:id, API /api/provisioning/import, KPICard, ForceGraphComponent, KPICard (local), PerformanceDashboard, ProvisioningInterface (provisioning re-export) (+3 more)

### Community 14 - "Error Monitoring (Sentry)"
Cohesion: 0.22
Nodes (8): Sentry error monitoring (DSN shared across environments), GlobalError(), Sentry.init (client), onRequestError, register(), sentry.client.config (intentionally empty), Sentry.init (edge), Sentry.init (server)

### Community 15 - "Admin Panel"
Cohesion: 0.25
Nodes (9): API /api/admin/login, API /api/admin/logout, API /api/admin/profiles, API /api/gsc, GscData type, Profile type, ProListingPage, Sparkline (pro listing local component) (+1 more)

### Community 16 - "Theme System"
Cohesion: 0.31
Nodes (6): theme (lib/theme), getTheme(), setTheme(), toggleTheme(), applyThemeToDom(), ThemeClient()

### Community 17 - "News Feed Module"
Cohesion: 0.29
Nodes (7): ArticlePayload type, ArticleRow component, ChannelPayload type, NewsCard component, ActualitesPage, SkeletonCard component, API /api/actualites/feeds route

### Community 18 - "Enterprise Portal Pages"
Cohesion: 0.47
Nodes (3): borderColor(), boxShadow(), handleSubmit()

### Community 19 - "Provisioning UI"
Cohesion: 0.4
Nodes (2): handleOrgFormNext(), validateOrg()

### Community 20 - "Provisioning Upload"
Cohesion: 0.33
Nodes (0): 

### Community 21 - "Admin API Routes"
Cohesion: 0.33
Nodes (6): GET (admin/leads), POST (admin/login), POST (admin/logout), DELETE (admin/profiles), GET (admin/profiles), GET (gsc)

### Community 22 - "App Layout & Branding"
Cohesion: 0.4
Nodes (4): SecuPRO Apple touch icon, SecuPRO app icon (Secu cyan + PRO salmon), metadata (SecuPRO site metadata), RootLayout()

### Community 23 - "Export Templates"
Cohesion: 0.5
Nodes (0): 

### Community 24 - "Graph Visualization"
Cohesion: 0.5
Nodes (0): 

### Community 25 - "Enterprise Activation"
Cohesion: 0.5
Nodes (2): handleActivation(), checkActivationCode()

### Community 26 - "News Feeds API"
Cohesion: 0.5
Nodes (4): ArticlePayload, ChannelPayload, fetchChannel, GET (actualites/feeds)

### Community 27 - "AI Suggestions Panel"
Cohesion: 0.5
Nodes (4): Agent type (ai-panel), AIPanel, Anomalie type, IASuggestion type

### Community 28 - "Pro Profile Management"
Cohesion: 0.83
Nodes (4): getProfile (async inner fn), handleUpdate (form handler), ProfilePage component, Supabase table: profiles

### Community 29 - "Agent News Page"
Cohesion: 0.67
Nodes (0): 

### Community 30 - "Espace Pro Auth"
Cohesion: 0.67
Nodes (0): 

### Community 31 - "Agent Support Page"
Cohesion: 0.67
Nodes (0): 

### Community 32 - "Trial Banner"
Cohesion: 1.0
Nodes (2): calcRemaining(), update()

### Community 33 - "Graph API & Viz"
Cohesion: 0.67
Nodes (3): API /api/graph, ForceGraphComponent, GraphVisualization

### Community 34 - "Audit Visualization"
Cohesion: 0.67
Nodes (3): AuditGraphVisualization, DownloadTemplate, TemplateData type

### Community 35 - "Provisioning Interface"
Cohesion: 0.67
Nodes (3): ProvisioningInterface, ProvisioningInterfacePage, ProvisioningPage

### Community 36 - "Agent Profile Session"
Cohesion: 0.67
Nodes (3): AgentProfile, getAgentProfile, upsertAgentProfile

### Community 37 - "Sitemap SEO"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Abonnement Page"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Agent Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Agent Activate Page"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Agent Code Page"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Agent Hub"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Agent Mission Page"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Agents Overview"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Agents List"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Dashboard Layout"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Main Dashboard"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Map Radar Component"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Enterprise Support"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Login Page"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Maintenance Page"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Performance Page"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Provisioning Page"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Provisioning Interface Page"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Register Page"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Verrou Tactique"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Dashboard Header"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Performance Dashboard"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Schedule Grid"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Auth Client"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Auth Guard"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "SecuPRO App Agent"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Agent Lead Service"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Agents Dashboard"
Cohesion: 1.0
Nodes (2): DashboardPage, DownloadTemplate

### Community 65 - "Performance Page Component"
Cohesion: 1.0
Nodes (2): PerformanceDashboard, PerformancePage

### Community 66 - "Live Feed & Schedule"
Cohesion: 1.0
Nodes (2): LiveFeed, ScheduleGrid

### Community 67 - "Instrumentation Client"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Next Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Next Config"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Sentry Client Config"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Sentry Edge Config"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Sentry Server Config"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "CGV Page"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Legal Mentions"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Success Page"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Agent Landing"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Agent Top Bar"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "Footer"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "Graph Viz Component"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "AI Panel Component"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "KPI Card Component"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "Live Feed Component"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Provisioning JSX"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "SecuApp Next Env"
Cohesion: 1.0
Nodes (0): 

### Community 88 - "Agent Droits Page"
Cohesion: 1.0
Nodes (0): 

### Community 89 - "SecuApp Supabase"
Cohesion: 1.0
Nodes (0): 

### Community 90 - "Router Transition"
Cohesion: 1.0
Nodes (1): onRouterTransitionStart

### Community 91 - "Tailwind Config"
Cohesion: 1.0
Nodes (1): @tailwindcss/postcss plugin config

### Community 92 - "Maintenance Component"
Cohesion: 1.0
Nodes (1): MaintenancePage

### Community 93 - "Lead Flag Check"
Cohesion: 1.0
Nodes (1): hasCompletedAgentLead

### Community 94 - "Lead Flag Clear"
Cohesion: 1.0
Nodes (1): clearAgentLeadFlags

### Community 95 - "SecuApp Next Env Alt"
Cohesion: 1.0
Nodes (1): next-env.d.ts (secupro-app)

### Community 96 - "Login Toggle"
Cohesion: 1.0
Nodes (1): togglePwd JS function

## Ambiguous Edges - Review These
- `createRapport()` → `sendMissionSignal()`  [AMBIGUOUS]
  services/rapportService.ts · relation: semantically_similar_to
- `DocsPage` → `POST (docs/analyze)`  [AMBIGUOUS]
  app/agent/docs/page.tsx · relation: calls
- `POST (checkout)` → `POST (docs/upload)`  [AMBIGUOUS]
  app/api/checkout/route.ts · relation: conceptually_related_to
- `MentionsLegalesPage` → `supabase (lib/supabaseClient)`  [AMBIGUOUS]
  app/mentions-legales/page.tsx · relation: conceptually_related_to
- `Header (dashboard)` → `API /api/admin/profiles`  [AMBIGUOUS]
  components/dashboard/header.tsx · relation: conceptually_related_to

## Knowledge Gaps
- **114 isolated node(s):** `onRouterTransitionStart`, `onRequestError`, `middleware config (matcher: /dashboard/:path*)`, `withSentryConfig export`, `@tailwindcss/postcss plugin config` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Sitemap SEO`** (2 nodes): `sitemap.ts`, `sitemap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Abonnement Page`** (2 nodes): `page.tsx`, `ForcePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Home Page`** (2 nodes): `page.tsx`, `PageAgent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Activate Page`** (2 nodes): `page.tsx`, `ActivatePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Code Page`** (2 nodes): `page.tsx`, `AgentCodePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Hub`** (2 nodes): `page.tsx`, `handleSignOut()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Mission Page`** (2 nodes): `page.tsx`, `MissionPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agents Overview`** (2 nodes): `page.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agents List`** (2 nodes): `page.jsx`, `AgentsListe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Layout`** (2 nodes): `layout.tsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Dashboard`** (2 nodes): `page.tsx`, `Dashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Map Radar Component`** (2 nodes): `MapRadar.tsx`, `MapRadar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Enterprise Support`** (2 nodes): `page.tsx`, `SupportCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Page`** (2 nodes): `page.tsx`, `handleSignIn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Maintenance Page`** (2 nodes): `page.tsx`, `MaintenancePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Performance Page`** (2 nodes): `page.tsx`, `PerformancePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Provisioning Page`** (2 nodes): `page.tsx`, `ProvisioningPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Provisioning Interface Page`** (2 nodes): `page.tsx`, `ProvisioningInterfacePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Register Page`** (2 nodes): `page.tsx`, `handleSignUp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Verrou Tactique`** (2 nodes): `VerrouTactique.tsx`, `VerrouTactique()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Header`** (2 nodes): `header.tsx`, `e()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Performance Dashboard`** (2 nodes): `PerformanceDashboard.tsx`, `fetchMetrics()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Schedule Grid`** (2 nodes): `schedule-grid.tsx`, `cfg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Client`** (2 nodes): `isAuthenticatedClient()`, `authClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Guard`** (2 nodes): `getApprovalStatus()`, `authGuard.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SecuPRO App Agent`** (2 nodes): `AgentPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Lead Service`** (2 nodes): `insertAgentLead()`, `agentLeadService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agents Dashboard`** (2 nodes): `DashboardPage`, `DownloadTemplate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Performance Page Component`** (2 nodes): `PerformanceDashboard`, `PerformancePage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Live Feed & Schedule`** (2 nodes): `LiveFeed`, `ScheduleGrid`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Instrumentation Client`** (1 nodes): `instrumentation-client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sentry Client Config`** (1 nodes): `sentry.client.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sentry Edge Config`** (1 nodes): `sentry.edge.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sentry Server Config`** (1 nodes): `sentry.server.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CGV Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Legal Mentions`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Success Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Landing`** (1 nodes): `AgentLanding.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Top Bar`** (1 nodes): `AgentTopBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer`** (1 nodes): `Footer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Graph Viz Component`** (1 nodes): `GraphVisualization.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AI Panel Component`** (1 nodes): `ai-panel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `KPI Card Component`** (1 nodes): `kpi-card.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Live Feed Component`** (1 nodes): `live-feed.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Provisioning JSX`** (1 nodes): `ProvisioningInterface.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabaseClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SecuApp Next Env`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Droits Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SecuApp Supabase`** (1 nodes): `supabaseClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Router Transition`** (1 nodes): `onRouterTransitionStart`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `@tailwindcss/postcss plugin config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Maintenance Component`** (1 nodes): `MaintenancePage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lead Flag Check`** (1 nodes): `hasCompletedAgentLead`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lead Flag Clear`** (1 nodes): `clearAgentLeadFlags`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SecuApp Next Env Alt`** (1 nodes): `next-env.d.ts (secupro-app)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Toggle`** (1 nodes): `togglePwd JS function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `createRapport()` and `sendMissionSignal()`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `DocsPage` and `POST (docs/analyze)`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **What is the exact relationship between `POST (checkout)` and `POST (docs/upload)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `MentionsLegalesPage` and `supabase (lib/supabaseClient)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Header (dashboard)` and `API /api/admin/profiles`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `DELETE()` connect `API Backend Services` to `Agent Workspace Pages`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `GET()` connect `API Backend Services` to `Auth & Docs APIs`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._