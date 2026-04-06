# Publish Checklist

Complete every item before publishing or deploying a new version of the course site.

## Content Accuracy
- [ ] Every Claude Code command verified against official docs
- [ ] All pricing figures dated and verified
- [ ] Experimental features labeled as such
- [ ] API key vs Pro subscription distinction clear in every relevant block
- [ ] Cost callouts on blocks 7, 10, 12

## Block Consistency
- [ ] Every block has a single index.md with `## Part 1: Presentation` and `## Part 2: Hands-On` sections
- [ ] Every index.md has front matter: layout, title, block_number, description, time, features, objectives
- [ ] Every Hands-On section has: Duration, Outcome, Prerequisites, steps, expected result, failure modes
- [ ] Block numbering is sequential (00-13)
- [ ] Previous/Next navigation works across all blocks

## Technical Accuracy
- [ ] Install command is correct
- [ ] Auth flow is accurate
- [ ] All shell commands are runnable
- [ ] All file paths in examples exist or will be created by the student
- [ ] K8s manifests match the ai-coderrank repo structure
- [ ] ArgoCD install commands are current
- [ ] GitHub Actions workflow YAML is valid

## Infrastructure
- [ ] Single default path: DO → k3s → NodePort 30080 → ArgoCD → GHCR
- [ ] Alternatives clearly marked as optional sidebars
- [ ] No reference to load balancers in default path
- [ ] Domain/TLS marked as optional
- [ ] Droplet size locked to s-2vcpu-4gb

## Site / Design
- [ ] Landing page renders correctly
- [ ] All 14 block cards link to correct pages
- [ ] Course TOC links work
- [ ] Resources pages accessible
- [ ] Mobile responsive layout works
- [ ] "Facts last verified" note visible
- [ ] Footer links correct
- [ ] 404 page works

## Links
- [ ] All internal links resolve (course blocks, resources)
- [ ] External links valid (Claude docs, GitHub repos, DO)
- [ ] ai-coderrank repo is public and accessible
- [ ] GitHub Pages URL works after deployment

## Final
- [ ] README.md accurate and up to date
- [ ] CLAUDE.md reflects current project state
- [ ] .gitignore covers all generated files
- [ ] No sensitive information in any file (API keys, tokens, passwords)
- [ ] Course contract (docs/course-contract.md) matches content
- [ ] Accuracy matrix reviewed
