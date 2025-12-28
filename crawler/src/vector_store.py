from pinecone import Pinecone
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from config import pinecone_key, index
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
