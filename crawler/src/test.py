"""
Test module for vector store search functionality.

This module provides an interactive test for the semantic search feature.
"""

from core.vector_store import query_search


def test_search() -> None:
    """
    Interactive test for semantic search.
    
    Prompts the user for a query and displays matching issues from the vector store.
    """
    user_query = input(
        "Describe your skills (e.g., 'I know React and want to fix bugs'): "
    )

    print("\n... Consulting the AI Matchmaker ...\n")

    matches = query_search(user_query)

    if not matches:
        print("No matches found.")
        return

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
