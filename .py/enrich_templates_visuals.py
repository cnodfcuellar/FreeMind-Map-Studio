import re

def enrich_content(content, filename=""):
    # Determine map blocks
    # Maps start with: export const NAME: MindMap = { or const NAME: MindMap = {
    # Let's process node blocks between lines
    lines = content.split('\n')
    new_lines = []
    
    in_nodes_section = False
    in_node = False
    current_node_lines = []
    current_map_is_dark = False
    
    for i, line in enumerate(lines):
        # Detect map header
        if "theme: 'dark'" in line or "cloud-arch" in line or "decision-tree" in line or "CYBERSECURITY" in line:
            current_map_is_dark = True
        elif "theme: '" in line or "theme: \"" in line:
            current_map_is_dark = False

        # Add edgeShadow to map if needed
        if "edgeDash: 'solid'" in line or "edgeDash: 'dashed'" in line:
            new_lines.append(line)
            # check if edgeShadow is already in following lines
            next_few = "\n".join(lines[i:i+6])
            if "edgeShadow" not in next_few:
                preset = 'glow' if current_map_is_dark else 'soft'
                indent = re.match(r'^\s*', line).group(0)
                new_lines.append(f"{indent}edgeShadow: true,")
                new_lines.append(f"{indent}edgeShadowPreset: '{preset}',")
            continue

        if "nodes: {" in line:
            in_nodes_section = True
            new_lines.append(line)
            continue
            
        if in_nodes_section and line.strip() == "}," and not in_node:
            # End of nodes: {
            in_nodes_section = False
            new_lines.append(line)
            continue

        if in_nodes_section:
            # Node start: e.g. "    root: {" or "    'node-id': {"
            if re.match(r'^\s{4}(?:root|\'[^\']+\'|[a-zA-Z0-9_-]+):\s*\{', line):
                in_node = True
                current_node_lines = [line]
                continue
            
            if in_node:
                current_node_lines.append(line)
                # Node end: "    },"
                if re.match(r'^\s{4}\},?', line):
                    in_node = False
                    # Enrich current_node_lines
                    block_text = "\n".join(current_node_lines)
                    if "nodeShadow" not in block_text:
                        is_root = "parentId: null" in block_text or "'root'" in current_node_lines[0] or "root:" in current_node_lines[0] or "side: 'root'" in block_text
                        
                        shadow_lines = []
                        if is_root:
                            if current_map_is_dark:
                                shadow_lines = [
                                    "      nodeShadow: true,",
                                    "      nodeShadowPreset: 'glow',",
                                    "      nodeShadowColor: '#38bdf8',",
                                ]
                            else:
                                shadow_lines = [
                                    "      nodeShadow: true,",
                                    "      nodeShadowPreset: 'medium',",
                                ]
                            if "shape: 'rectangle'" in block_text and "rectCornerStyle" not in block_text:
                                shadow_lines.append("      rectCornerStyle: 'bevel',")
                            if "borderWidth" not in block_text:
                                shadow_lines.append("      borderWidth: 2.5,")
                        else:
                            if current_map_is_dark:
                                shadow_lines = [
                                    "      nodeShadow: true,",
                                    "      nodeShadowPreset: 'glow',",
                                ]
                            else:
                                shadow_lines = [
                                    "      nodeShadow: true,",
                                    "      nodeShadowPreset: 'soft',",
                                ]
                            if "borderWidth" not in block_text and "borderColor" in block_text:
                                shadow_lines.append("      borderWidth: 1.5,")
                        
                        # Insert shadow_lines before the closing line
                        enriched_block = current_node_lines[:-1] + shadow_lines + [current_node_lines[-1]]
                        new_lines.extend(enriched_block)
                    else:
                        new_lines.extend(current_node_lines)
                    current_node_lines = []
                    continue
                continue

        new_lines.append(line)
        
    return "\n".join(new_lines)

for fp in ['src/utils/additionalTemplates.ts', 'src/utils/sampleMaps.ts']:
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    res = enrich_content(c, fp)
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(res)
    print(f"Enriched {fp} successfully.")
