# Qortara public and Secure Workspace boundary

The MythologIQ Labs organization Pages site is the public front door.

Qortara is the product-family umbrella. Public presentation must distinguish sibling products from customer-facing modules rather than projecting repository names into the product model.

At minimum the public Qortara write-up should identify:

- **Qortara SDLC** as the governed software-delivery product;
- Qortara SDLC modules **Development**, **Governance**, **Oversight**, **Compliance**, **Evidence**, **Operations**, and **Administration**;
- **Qortara Agent Governance** as a sibling Qortara product, explicitly not a Qortara SDLC module.

Repository/source identities such as `qor-oversight`, `qor-compliance`, `Qor-logic`, and `Qor-logic-plus` remain appropriate for technical documentation, provenance, implementation ownership, and open-source links. They are not required to become the public customer-facing module labels.

The public write-up is descriptive only. It is not a private-workspace entry point.

The **Secure Workspace** control in the site header is the single private Qortara workspace entry. It points to the authenticated GitHub Pages workspace root.

There must not be a second `Open Qortara` control or another public-site action that enters the same private workspace.

This boundary preserves:

```text
public MythologIQ front door
  -> public Qortara family/product/module explanation
  -> one explicit Secure Workspace entry
  -> private Qortara operational surfaces
```

The current GitHub Pages host is a delivery surface, not semantic authority. Qortara SDLC owns its product application and composition; source repositories retain their semantic authority behind the customer-facing modules; Qortara Agent Governance remains a sibling product.