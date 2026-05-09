# Deterministic Checks

Mechanical grep / structural patterns that this skill can run against the diff or working tree to surface candidate findings. These are starting points for human or agent reasoning, not verdicts. A pattern match is a *signal*, not a conclusion — confirm by reading context.

Coverage is limited to invariants where mechanical detection adds value. The remaining invariants are reasoning-driven; their checks live in the corresponding `INV-N-*.md` reference files.

{{DETERMINISTIC_CHECKS_PER_INV}}

<!--
Section template (per invariant with mechanical checks):

## {{INV_ID}}: {{INV_NAME}}

### Check {{INV_NUMBER}}.1: {{CHECK_NAME}}

{{CHECK_DESCRIPTION}}

```bash
{{CHECK_COMMAND}}
```

(Add additional checks {{INV_NUMBER}}.2, {{INV_NUMBER}}.3, ... as needed.)
-->

<!--
For invariants without mechanical checks, omit the section and rely on the
reasoning-driven checks documented in `INV-N-*.md`.
-->
