import re

with open('src/utils/additionalTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace specific node shape definitions across the 10 additional templates
replacements = {
    # 1. AI Roadmap
    "'ai-models'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'ai-slm-edge'": [("shape: 'bubble'", "shape: 'oval'")],
    "'ai-finetune'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'ai-agents'": [("shape: 'bubble'", "shape: 'star'")],
    "'ai-planner'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'ai-memory'": [("shape: 'bubble'", "shape: 'circle'")],
    "'ai-chunking'": [("shape: 'bubble'", "shape: 'square'")],
    "'ai-vector-db'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'ai-eval'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'ai-infra'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'ai-gpu-cluster'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'ai-mlops'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'ai-safety'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'ai-guardrails'": [("shape: 'bubble'", "shape: 'oval'")],
    "'ai-redteam'": [("shape: 'bubble'", "shape: 'square'")],
    "'ai-ux'": [("shape: 'bubble'", "shape: 'circle'")],
    "'ai-voice'": [("shape: 'bubble'", "shape: 'circle'")],
    "'ai-multimodal'": [("shape: 'bubble'", "shape: 'star'")],

    # 2. SWOT Analysis
    "'foda-f1'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'foda-f2'": [("shape: 'bubble'", "shape: 'oval'")],
    "'foda-o1'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'foda-o2'": [("shape: 'bubble'", "shape: 'star'")],
    "'foda-d1'": [("shape: 'bubble'", "shape: 'square'")],
    "'foda-d2'": [("shape: 'bubble'", "shape: 'fork'")],
    "'foda-a1'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'foda-a2'": [("shape: 'bubble'", "shape: 'rectangle'")],

    # 3. Cybersecurity NIST
    "'nist-identify'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'nist-id-assets'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'nist-id-risk'": [("shape: 'bubble'", "shape: 'oval'")],
    "'nist-protect'": [("shape: 'bubble'", "shape: 'star'")],
    "'nist-pr-iam'": [("shape: 'bubble'", "shape: 'pill'")],
    "'nist-pr-zero-trust'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'nist-detect'": [("shape: 'bubble'", "shape: 'circle'")],
    "'nist-de-siem'": [("shape: 'bubble'", "shape: 'square'")],
    "'nist-respond'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'nist-recover'": [("shape: 'bubble'", "shape: 'pill'")],

    # 4. Customer Journey
    "'cj-awareness'": [("shape: 'bubble'", "shape: 'star'")],
    "'cj-aw-ads'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'cj-consideration'": [("shape: 'bubble'", "shape: 'circle'")],
    "'cj-decision'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'cj-dec-checkout'": [("shape: 'bubble'", "shape: 'pill'")],
    "'cj-retention'": [("shape: 'bubble'", "shape: 'oval'")],
    "'cj-advocacy'": [("shape: 'bubble'", "shape: 'arrow'")],

    # 5. Pitch Deck
    "'pitch-problem'": [("shape: 'bubble'", "shape: 'square'")],
    "'pitch-solution'": [("shape: 'bubble'", "shape: 'star'")],
    "'pitch-market'": [("shape: 'bubble'", "shape: 'circle'")],
    "'pitch-business'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'pitch-traction'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'pitch-team'": [("shape: 'bubble'", "shape: 'oval'")],

    # 6. Fullstack Roadmap
    "'fs-frontend'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'fs-fe-react'": [("shape: 'bubble'", "shape: 'oval'")],
    "'fs-fe-tailwind'": [("shape: 'bubble'", "shape: 'pill'")],
    "'fs-backend'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'fs-be-node'": [("shape: 'bubble'", "shape: 'circle'")],
    "'fs-database'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'fs-devops'": [("shape: 'bubble'", "shape: 'star'")],

    # 7. Financial Budget
    "'fin-income'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'fin-inc-arr'": [("shape: 'bubble'", "shape: 'oval'")],
    "'fin-opex'": [("shape: 'bubble'", "shape: 'square'")],
    "'fin-capex'": [("shape: 'bubble'", "shape: 'rectangle'")],
    "'fin-cashflow'": [("shape: 'bubble'", "shape: 'circle'")],

    # 8. Design System
    "'ds-tokens'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'ds-tok-color'": [("shape: 'bubble'", "shape: 'circle'")],
    "'ds-atoms'": [("shape: 'bubble'", "shape: 'square'")],
    "'ds-molecules'": [("shape: 'bubble'", "shape: 'pill'")],
    "'ds-organisms'": [("shape: 'bubble'", "shape: 'star'")],
    "'ds-templates'": [("shape: 'bubble'", "shape: 'rectangle'")],

    # 9. Content Creator
    "'cc-ideation'": [("shape: 'bubble'", "shape: 'star'")],
    "'cc-production'": [("shape: 'bubble'", "shape: 'circle'")],
    "'cc-distribution'": [("shape: 'bubble'", "shape: 'arrow'")],
    "'cc-monetization'": [("shape: 'bubble'", "shape: 'hexagon'")],

    # 10. Health & Wellness
    "'hw-sleep'": [("shape: 'bubble'", "shape: 'oval'")],
    "'hw-nutrition'": [("shape: 'bubble'", "shape: 'hexagon'")],
    "'hw-fitness'": [("shape: 'bubble'", "shape: 'star'")],
    "'hw-mind'": [("shape: 'bubble'", "shape: 'circle'")],
}

for node_id, repl_list in replacements.items():
    idx = content.find(node_id)
    if idx != -1:
        # search the next closing node object
        end_idx = content.find("},", idx)
        if end_idx != -1:
            node_block = content[idx:end_idx]
            for old_shape, new_shape in repl_list:
                node_block = node_block.replace(old_shape, new_shape, 1)
            content = content[:idx] + node_block + content[end_idx:]

with open('src/utils/additionalTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done enriching additionalTemplates.ts!')
