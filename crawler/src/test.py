from core.vector_store import vectorDB

def test_search():
    vdb = vectorDB()

    # Simulating a user query
    user_query = input(
        "Describe your skills (e.g., 'I know React and want to fix bugs'): "
    )

    print("\n... Consulting the AI Matchmaker ...\n")

    matches = vdb.querySearch(user_query)

    for match in matches:
        score = match["score"]
        metadata = match["metadata"]

        # Pinecone returns a score from 0 to 1 (Cosine Similarity)
        # > 0.7 is usually a good match
        print(f"🔗 Match ({score:.2f}): {metadata.get('title')}")
        print(f"   Repo: {metadata.get('repo')}")
        print(f"   URL: {metadata.get('url')}")
        print("-" * 30)


if __name__ == "__main__":
    test_search()
