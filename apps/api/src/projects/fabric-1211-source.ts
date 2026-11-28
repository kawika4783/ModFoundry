import { BadRequestException } from '@nestjs/common';
import { parseDocument } from './document';

type Profile = { key: string; revision: number; edition: string; gameVersion: string; loader: string | null };

/** Inspectable source only. Compilation and in-game validation are separate gates. */
export function generateFabric1211Source(profile: Profile, projectSlug: string, input: unknown) {
  if (profile.key !== 'java-1.21.1-fabric-candidate' || profile.revision !== 1 ||
      profile.edition !== 'JAVA' || profile.gameVersion !== '1.21.1' || profile.loader !== 'FABRIC') {
    throw new BadRequestException('No source adapter is available for this configuration');
  }
  const document = parseDocument(input);
  const modId = 'mf_' + projectSlug.replace(/-/g, '_');
  if (!/^mf_[a-z0-9_]{1,63}$/.test(modId)) throw new BadRequestException('Invalid project namespace');
  const id = document.identifier as string;
  const name = document.displayName as string;
  const item = document.kind === 'item';
  const files: Record<string, string> = {};
  const resources = `src/main/resources/assets/${modId}`;
  const data = `src/main/resources/data/${modId}`;
  files['src/main/java/com/modfoundry/generated/ModFoundryMod.java'] = item
    ? `package com.modfoundry.generated;\n\nimport net.fabricmc.api.ModInitializer;\nimport net.minecraft.item.Item;\nimport net.minecraft.registry.Registries;\nimport net.minecraft.registry.Registry;\nimport net.minecraft.util.Identifier;\n\npublic final class ModFoundryMod implements ModInitializer {\n    public static final String MOD_ID = "${modId}";\n    public static final Item GENERATED_ITEM = Registry.register(Registries.ITEM, Identifier.of(MOD_ID, "${id}"), new Item(new Item.Settings().maxCount(${document.stackSize})));\n\n    @Override public void onInitialize() { }\n}\n`
    : `package com.modfoundry.generated;\n\nimport net.fabricmc.api.ModInitializer;\nimport net.minecraft.block.AbstractBlock;\nimport net.minecraft.block.Block;\nimport net.minecraft.item.BlockItem;\nimport net.minecraft.item.Item;\nimport net.minecraft.registry.Registries;\nimport net.minecraft.registry.Registry;\nimport net.minecraft.util.Identifier;\n\npublic final class ModFoundryMod implements ModInitializer {\n    public static final String MOD_ID = "${modId}";\n    public static final Block GENERATED_BLOCK = Registry.register(Registries.BLOCK, Identifier.of(MOD_ID, "${id}"), new Block(AbstractBlock.Settings.create().strength(${document.hardness}f).luminance(state -> ${document.lightLevel})));\n    public static final Item GENERATED_ITEM = Registry.register(Registries.ITEM, Identifier.of(MOD_ID, "${id}"), new BlockItem(GENERATED_BLOCK, new Item.Settings()));\n\n    @Override public void onInitialize() { }\n}\n`;
  files['src/main/resources/fabric.mod.json'] = json({
    schemaVersion: 1, id: modId, version: '1.0.0', name,
    environment: '*', entrypoints: { main: ['com.modfoundry.generated.ModFoundryMod'] },
    depends: { fabricloader: '>=0.16.0', minecraft: '1.21.1', java: '>=21' },
  });
  files['src/main/resources/pack.mcmeta'] = json({ pack: { pack_format: 34, description: `${name} assets` } });
  files[`${resources}/lang/en_us.json`] = json({ [`${item ? 'item' : 'block'}.${modId}.${id}`]: name });
  if (item) {
    files[`${resources}/models/item/${id}.json`] = json({ parent: 'minecraft:item/generated', textures: { layer0: 'minecraft:item/apple' } });
  } else {
    files[`${resources}/blockstates/${id}.json`] = json({ variants: { '': { model: `${modId}:block/${id}` } } });
    files[`${resources}/models/block/${id}.json`] = json({ parent: 'minecraft:block/cube_all', textures: { all: 'minecraft:block/stone' } });
    files[`${resources}/models/item/${id}.json`] = json({ parent: `${modId}:block/${id}` });
    files[`${data}/loot_table/blocks/${id}.json`] = json({ type: 'minecraft:block', pools: [{ rolls: 1, entries: [{ type: 'minecraft:item', name: `${modId}:${id}` }], conditions: [{ condition: 'minecraft:survives_explosion' }] }] });
  }
  return {
    profileKey: profile.key, revision: profile.revision, modId, documentKind: document.kind,
    status: 'UNTESTED_SOURCE',
    diagnostics: ['Source has not been compiled or tested in Minecraft.', 'Vanilla placeholder textures are used until custom textures are implemented.'],
    files,
  };
}

function json(value: unknown) { return JSON.stringify(value, null, 2) + '\n'; }
