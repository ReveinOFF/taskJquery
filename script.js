$(document).ready(async function () {
  let typingTimer;
  let products;
  let categories;
  const CACHE_TTL = 60 * 1000;
  const API_URL = "https://fakestoreapi.com/products?limit=20";
  const API_URL_CATEGORIES = "https://fakestoreapi.com/products/categories";
  const CACHE_NAME = "cache";

  $("#loading").show();

  const cache = await caches.open(CACHE_NAME);

  async function fetchData(useCache = true) {
    if (useCache) {
      const cachedResponse = await cache.match(API_URL);
      if (cachedResponse) {
        const cachedTime = new Date(
          cachedResponse.headers.get("X-Cached-Time")
        );
        if (Date.now() - cachedTime.getTime() < CACHE_TTL) {
          const data = await cachedResponse.json();
          products = data;
          $("#loading").hide();
          displayData(data);
          return;
        } else {
          await cache.delete(API_URL);
        }
      }
    }

    $.ajax({
      type: "GET",
      url: API_URL,
      success: async function (data, status, xhr) {
        $("#loading").hide();
        products = data;

        const responseHeaders = xhr.getAllResponseHeaders();
        const headers = new Headers();

        responseHeaders.split("\r\n").forEach((header) => {
          const [key, value] = header.split(": ");
          if (key && value) {
            headers.append(key, value);
          }
        });

        headers.append("X-Cached-Time", new Date().toISOString());

        const customResponse = new Response(JSON.stringify(data), {
          headers,
        });
        await cache.put(API_URL, customResponse);

        displayData(data);
      },
      error: function () {
        $("#loading").hide();
        $("#product_list").text("Ошибка загрузки данных.");
      },
    });
  }

  async function fetchDataCategories() {
    const cachedResponse = await cache.match(API_URL_CATEGORIES);
    if (cachedResponse) {
      const cachedTime = new Date(cachedResponse.headers.get("X-Cached-Time"));
      if (Date.now() - cachedTime.getTime() < CACHE_TTL) {
        const data = await cachedResponse.json();
        categories = data;
        displayDataCategories(data);
        return;
      } else {
        await cache.delete(API_URL);
      }
    }

    $.ajax({
      type: "GET",
      url: API_URL_CATEGORIES,
      success: async function (data, status, xhr) {
        categories = data;

        const responseHeaders = xhr.getAllResponseHeaders();
        const headers = new Headers();

        responseHeaders.split("\r\n").forEach((header) => {
          const [key, value] = header.split(": ");
          if (key && value) {
            headers.append(key, value);
          }
        });

        headers.append("X-Cached-Time", new Date().toISOString());

        const customResponse = new Response(JSON.stringify(data), {
          headers,
        });
        await cache.put(API_URL_CATEGORIES, customResponse);

        displayDataCategories(data);
      },
      error: function () {
        $("#product_list").text("Ошибка загрузки данных.");
      },
    });
  }

  function displayData(data) {
    $("#product_list").empty();
    data.forEach((element) => {
      $("#product_list").append(
        `<a href="/product.html?id=${element.id}" class="product" id="p${element.id}">
          <img src="${element.image}" loading="lazy" alt="product_img" />
          <div class="product_info">
            <div class="product_category">${element.category}</div>
            <div class="product_name">${element.title}</div>
            <div class="product_price">${element.price}$</div>
            <div class="product_description">${element.description}</div>
          </div>
        </a>`
      );
    });
  }

  function displayDataCategories(data) {
    $(".category_list").empty();
    $(".category_list").append(
      `<div class="category" id="all">
          all
        </div>`
    );
    data.forEach((element) => {
      $(".category_list").append(
        `<div class="category" id="${element}">
          ${element}
        </div>`
      );
    });

    $(".category").on("click", function () {
      const val = $(this).attr("id");
      $(".curr_cat:visible").first().text(val);
      let catSortData = {};
      if (val === "all") catSortData = products;
      else catSortData = products.filter((item) => item.category === val);
      displayData(catSortData);
      $(".category_list").removeClass("show");
    });
  }

  const sortByPriceAsc = (a, b) => a.price - b.price;
  const sortByPriceDesc = (a, b) => b.price - a.price;
  const sortByRating = (a, b) => b.rating.rate - a.rating.rate;
  const sortProducts = (products, sortFunction) => {
    return [...products].sort(sortFunction);
  };

  function updateProducts(newProducts) {
    $(".product").addClass("hidden");

    setTimeout(function () {
      displayData(newProducts);

      $(".product").removeClass("hidden");
    }, 500);
  }

  $("#search_input").on("input", function () {
    clearTimeout(typingTimer);
    const val = $(this).val().toLocaleLowerCase();

    typingTimer = setTimeout(async () => {
      if (!products) {
        $("#loading").show();
        await fetchData();
      }

      const filteredData = products.filter((item) =>
        item.title?.toLocaleLowerCase().includes(val)
      );
      displayData(filteredData);
    }, 1000);
  });

  $(".curr_cat").on("click", function () {
    $(".category_list:visible").first().toggleClass("show");
  });

  $("#rating").on("click", function () {
    if ($("#rating").hasClass("active")) {
      $("#rating").removeClass("active");
      updateProducts(products);
    } else {
      $("#priceI").removeClass("active");
      $("#priceD").removeClass("active");
      $("#rating").addClass("active");
      const sordData = sortProducts(products, sortByRating);
      updateProducts(sordData);
    }
  });

  $("#priceI").on("click", function () {
    if ($("#priceI").hasClass("active")) {
      $("#priceI").removeClass("active");
      updateProducts(products);
    } else {
      $("#rating").removeClass("active");
      $("#priceD").removeClass("active");
      $("#priceI").addClass("active");
      const sordData = sortProducts(products, sortByPriceAsc);
      updateProducts(sordData);
    }
  });

  $("#priceD").on("click", function () {
    if ($("#priceD").hasClass("active")) {
      $("#priceD").removeClass("active");
      updateProducts(products);
    } else {
      $("#rating").removeClass("active");
      $("#priceI").removeClass("active");
      $("#priceD").addClass("active");
      const sordData = sortProducts(products, sortByPriceDesc);
      updateProducts(sordData);
    }
  });

  $("#burger").on("click", function () {
    $(".burger_menu").addClass("show-burg");
    $(".burger_f").addClass("burger_f_show");
    $("body").css("overflow-y", "hidden");
  });

  $("#burger_cross").on("click", function () {
    $(".burger_menu").removeClass("show-burg");
    $("body").css("overflow-y", "");
    $(".burger_f").removeClass("burger_f_show");
  });

  const lang = localStorage.getItem("lang") || "en";
  $('select option[value="en"]').prop("selected", false);
  if (lang === "en") $('select option[value="en"]').prop("selected", true);
  else if (lang === "ru") $('select option[value="ru"]').prop("selected", true);
  else if (lang === "ua") $('select option[value="ua"]').prop("selected", true);

  $("#loading").show();
  fetchData();
  fetchDataCategories();
});

$(document).on("click", function (event) {
  console.log($(event.target).closest(".category_list"));
  if (
    !$(event.target).closest(".category_list").length &&
    !$(event.target).closest(".curr_cat").length
  ) {
    $(".category_list.show").removeClass("show");
  }

  if (
    !$(event.target).closest("#burger").length &&
    !$(event.target).closest(".burger_menu").length
  ) {
    $(".burger_menu").removeClass("show-burg");
    $(".burger_f").removeClass("burger_f_show");
    $("body").css("overflow-y", "");
  }
});
