import main from "./main";

const port = process.env.PORT || 3000;

main.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});
