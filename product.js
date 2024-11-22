$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  $.ajax({
    type: "GET",
    url: `https://fakestoreapi.com/products/${id}`,
    success: async function (data, status, xhr) {
      $("#img").attr("src", data.image);
      $("#product_title").text(data.title);
      $("#product_price").text(`${data.price}$`);
      $("#product_category").text(data.category);
      $("#product_rating").text(`Rating: ${data.rating.rate}`);
      $("#product_description").text(data.description);
    },
  });
});
