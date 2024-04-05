<template>
    <v-expansion-panels v-if="usage.length > 0">
        <v-expansion-panel class="ma-2">
            <v-expansion-panel-title>Usage : {{ usage.length }}</v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-list :items="usage" />
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>

export default {
    name: 'Usage',
    props: ['usage'],
}
</script>