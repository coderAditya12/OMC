from pinecone import Pinecone
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from core.config import pinecone_key, index
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()
# embedding model


class vectorDB:
    def __init__(self):
        self.pc = Pinecone(pinecone_key)
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004"
        )
        self.index = self.pc.Index(index)
        self.vector_store = PineconeVectorStore(
            embedding=self.embeddings, index=self.index
        )

    def upsert_issues(self, issues):
        """
        Takes a list of Issue dictionaries (or objects), creates embeddings,
        and uploads to Pinecone.
        """
        print(f" Generating embeddings for {len(issues)} issues...")
        vector_to_upload = []
        for issue in issues:
            text_to_embed = f"Title:{issue.title}\nBody:{issue.body or ''}"
            generate_embeddings = self.embeddings.embed_query(text_to_embed)
            vector_to_upload.append(
                {
                    "id": str(issue.github_issue_id),
                    "values": generate_embeddings,
                    "metadata": {
                        "url": issue.url,
                        "title": issue.title,
                        "repo": issue.repo_name,
                    },
                }
            )
        if vector_to_upload:
            self.index.upsert(vectors=vector_to_upload)
            print(f"Successfully uploaded {len(vector_to_upload)} vectors to pinecone")

    def querySearch(self, query: str, top_k: int = 5):
        """
        Search for similar issues in Pinecone.

        Args:
            query: The user's search text (e.g., "Python loops")
            top_k: Number of results to return (default: 5)

        Returns:
            A list of matches, each containing 'id', 'score', and 'metadata'
        """
        query_embedding = self.embeddings.embed_query(query)

        # results = self.index.search(
        #     query={"top_k": top_k, input: {"text": query_embedding}},
        #     namespace=""
        # )
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,  # Critical: We need the URL/Title back!
        )
        matches = []
        for match in results.get("matches", []):
            matches.append(
                {
                    "id": match["id"],
                    "score": match["score"],
                    "metadata": match.get("metadata", {}),
                }
            )

        return matches
