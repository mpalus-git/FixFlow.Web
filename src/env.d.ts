interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEMO_DISPATCHER_EMAIL?: string;
  readonly VITE_DEMO_DISPATCHER_PASSWORD?: string;
  readonly VITE_DEMO_TECHNICIAN_EMAIL?: string;
  readonly VITE_DEMO_TECHNICIAN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
