# Qortara public and Secure Workspace boundary

The MythologIQ Labs organization Pages site is the public front door.

Qortara is presented publicly as a family of distinct product/component surfaces rather than as one monolithic application. The public Qortara write-up should identify at minimum:

- Qortara SDLC;
- Qor Oversight;
- Qor Compliance;
- Qortara Agent Governance.

The public write-up is descriptive only. It is not a private-workspace entry point.

The **Secure Workspace** control in the site header is the single private Qortara workspace entry. It points to the authenticated GitHub Pages workspace root.

There must not be a second `Open Qortara` control or another public-site action that enters the same private workspace.

This boundary preserves:

```text
public MythologIQ front door
  -> public product/component explanation
  -> one explicit Secure Workspace entry
  -> private Qortara operational surfaces
```

The current GitHub Pages host is a delivery surface, not semantic authority. Qortara SDLC owns application composition; Qor Oversight and Qor Compliance retain their component semantics and authority boundaries.