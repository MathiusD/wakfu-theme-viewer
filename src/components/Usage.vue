<template>
    <v-list v-if="usage.length > 0" class="ma-2" v-model:opened="open">
        <v-list-group value="parent:usage">
            <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" :title="'Usage : ' + usage.length" value="parent:usage" />
            </template>

            <v-list-group v-if="themeElementUsage.length > 0" value="parent:themeElement">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="'Theme Elements : ' + themeElementUsage.length"
                        value="parent:themeElement" />
                </template>

                <v-list-item v-for="(use, i) in themeElementUsage" :key="i" :title="use.title" :value="use.id" />
            </v-list-group>

            <v-list-group v-if="dialogUsage.length > 0" value="parent:dialog">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="'Dialogs : ' + dialogUsage.length" value="parent:dialog" />
                </template>

                <v-list-item v-for="(use, i) in dialogUsage" :key="i" :title="use.title" :value="use.id" />
            </v-list-group>
        </v-list-group>
    </v-list>
</template>

<script>

export default {
    name: 'Usage',
    props: ['usage'],

    data: () => ({
        open: []
    }),

    mounted() {
        if (this.usage.length == 0) {
            this.open = [];
            return;
        }

        let themeElementUsageCount = this.themeElementUsage.length;
        let dialogUsageCount = this.dialogUsage.length;
        if (themeElementUsageCount > 0 && dialogUsageCount > 0) {
            this.open = [];
        } else if (themeElementUsageCount > 0) {
            this.open = ["parent:themeElement"];
        } else {
            this.open = ["parent:dialog"];
        }
    },

    methods: {
        /**
         * Return use type if exist
         * @param {String} use use specification
         * @returns user type if exist null otherwise
         */
        retrieveUseType(use) {
            let splitted = use.split(':');
            if (splitted.length < 2) return false;

            return splitted[0];
        },
        /**
         * Return true if usage provided is a theme element
         * @param {String} use use specification
         * @returns true if is themeElement
         */
        isThemeElement(use) {
            return this.retrieveUseType(use) == 'themeElement';
        },
        /**
         * Return sub part of usage provided if have sub part
         * @param {String} use use specification
         * @returns sub part of use
         */
        retrieveSubElement(use) {
            let splitted = use.split(':');
            if (splitted.length < 2) return null;

            return splitted[1];
        }
    },

    computed: {
        themeElementUsage() {
            return this.usage.filter(
                use => this.isThemeElement(use)
            ).map(use => {
                return {
                    title: this.retrieveSubElement(use),
                    id: use
                }
            });
        },
        dialogUsage() {
            return this.usage.filter(
                use => !this.isThemeElement(use)
            ).map(use => {
                return {
                    title: use,
                    id: use
                }
            });
        }
    },
}
</script>