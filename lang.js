$(document).ready(async function () {
  const defaultLang = "en";
  let currentLang = localStorage.getItem("lang") || defaultLang;

  function loadTranslations(lang) {
    $.ajax({
      url: `./assets/locales/${lang}.json`,
      dataType: "json",
      success: function (translations) {
        $("[data-translate]").each(function () {
          const key = $(this).data("translate");
          $(this).text(translations[key] || key);
        });
        localStorage.setItem("lang", lang);
      },
      error: function () {
        console.error(`Translations for ${lang} not found.`);
      },
    });
  }

  $(".language-selector")
    .val(currentLang)
    .on("change", function () {
      const selectedLang = $(this).val();
      currentLang = selectedLang;
      loadTranslations(selectedLang);
    });

  loadTranslations(currentLang);
});
