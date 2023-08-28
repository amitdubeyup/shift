export default defineNuxtConfig({
  css: ["~/assets/main.css"],
  modules: ["@pinia/nuxt", "@vee-validate/nuxt"],
  imports: {
    dirs: ["./stores"],
  },
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },
  build: {
    transpile: ["vue-toastification", "@vuepic/vue-datepicker"],
  },
});
