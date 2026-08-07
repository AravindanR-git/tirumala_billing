const TEMPLATE_STORAGE_KEY = "receiptTemplateOverrides";

/** Mine A v1 mirrors the established 66 mm Delivery Challan layout. */
export const receiptTemplateRegistry = {
  mineA: {
    id: "mineA",
    version: 1,
    label: "Quarry A / Mine A",
    paperWidthMm: 66,
    paddingMm: 4,
    title: "Delivery Challan",
    tripTitle: "OUTGOING TRIP",
    fields: ["party", "loading", "unloading", "transport", "truck", "item", "empty", "full", "net", "payment"],
  },
};

export function getReceiptTemplate(templateId = "mineA", version = 1) {
  const template = receiptTemplateRegistry[templateId] || receiptTemplateRegistry.mineA;
  if (version !== template.version) return template;

  try {
    const overrides = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || "{}");
    const override = overrides[`${template.id}@${template.version}`];
    return override ? { ...template, ...override, id: template.id, version: template.version } : template;
  } catch {
    return template;
  }
}

/** Reserved for a template editor; keeps user edits version-scoped and non-destructive. */
export function saveReceiptTemplateOverride(templateId, version, override) {
  const overrides = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY) || "{}");
  overrides[`${templateId}@${version}`] = override;
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(overrides));
}
