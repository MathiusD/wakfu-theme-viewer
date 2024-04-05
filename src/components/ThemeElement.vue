<template>
    <v-card class="ma-2" :variant="vCardVariant">
        <v-card-title>{{ themeElement.id }}</v-card-title>
        <v-card-text>
            <span v-if="themeElement.type">Type : {{ themeElement.type }} <br /></span>
            <span v-if="themeElement.name">Name : {{ themeElement.name }} <br /></span>
            <span v-if="themeElement.since">Since : {{ themeElement.since }} <br /></span>
            <Usage v-if="themeElement.usage" :usage="themeElement.usage" />
        </v-card-text>
    </v-card>
    <Pixmap v-for="pixmap of themeElement.pixmaps" :pixmap="pixmap" :forcedUsages="getUsageOfPixmap(pixmap)"
        :key="pixmap.id" :vCardVariant="vCardVariant" />
</template>

<script>
import Pixmap from './Pixmap.vue';
import Usage from './Usage.vue';

export default {
    name: 'ThemeElement',
    props: ['themeElement', 'vCardVariant'],
    components: {
        Pixmap,
        Usage
    },

    methods: {
        getUsageOfPixmap(pixmap) {
            if (!this.themeElement.usage) return null;

            return this.themeElement.usage.filter(
                x => pixmap.usage && !pixmap.usage.includes(x)
            );
        }
    }
}
</script>