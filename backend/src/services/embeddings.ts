import axios from "axios";

async function getEmbedding(text: String) {
  const res = await axios.post(`http://0.0.0.0:${process.env.MICROSERVICE_PORT}`, { text });
  return res.data.embedding;
}

// Example
(async () => {
  const embedding = await getEmbedding("HIV");
  console.log(embedding.length); // 384
})();
