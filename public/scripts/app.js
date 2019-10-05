$("#scrapeArticles").on("click", e => {
  fetch("/scrape").then(() => {
    location.reload();
  });
});

$("#clearArticles").on("click", e => {
  fetch("/clear").then(() => {
    location.reload();
  });
});

// no users per se so articles are saved in local storage
$(".saveArticle").on("click", async function() {
  const id = $(this).data("article");
  const response = await fetch(`/api/articles/${id}/saved`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ saved: true })
  });
  const data = await response.json();
  console.log(data);
});

$(".commentPost").on("click", async function(e) {
  e.preventDefault();
  const $commentBody = $(this).siblings(".commentBody");
  const articleID = $(this).data("article");
  const body = $commentBody.val();
  const response = await fetch(`/api/articles/${articleID}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ comment: body })
  });
  const data = await response.json();
  const $comments = $(`.comments[data-article="${articleID}"]`);
  $comments.append(createComment(data));
  $commentBody.val("");
});

function createComment(comment) {
  return $("<div>")
    .addClass("comment")
    .attr("data-id", comment._id)
    .attr("data-article", comment.article)
    .append(
      $("<div>")
        .addClass("w-100 d-flex")
        .append($("<div>").text(comment.body))
        .append(
          $("<button>")
            .attr("data-id", comment._id)
            .attr("data-article", comment.article)
            .addClass("deleteComment btn btn-outline-danger btn-sm rounded ml-auto")
            .text("Delete")
            .on("click", deleteOnClick)
        )
    )
    .append("<hr>");
}

async function deleteOnClick(e) {
  e.preventDefault();
  const commentID = $(this).data("id");
  const articleID = $(this).data("article");
  const response = await fetch(`/api/comments/${commentID}`, { method: "DELETE" });
  if (response.status === 200) {
    $(`.comment[data-article="${articleID}"][data-id=${commentID}]`).remove();
  }
}
$(".deleteComment").on("click", deleteOnClick);
