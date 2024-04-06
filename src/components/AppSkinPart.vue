<template>
    <v-card class="ma-2" :variant="vCardVariant">
        <v-card-title>{{ appSkinPart.id }}</v-card-title>
        <v-card-subtitle>
            App Skin Part : <a :href="appSkinPart.assetUrl" target="_blank">
                {{ appSkinPart.path }}
            </a>
        </v-card-subtitle>
        <v-card-text>
            <img :src="appSkinPart.assetUrl" :alt="appSkinPart.id" />
        </v-card-text>
    </v-card>
</template>

<script>

export default {
    name: 'AppSkinPart',
    props: ['appSkinPart', 'vCardVariant'],
}
</script>