import string


def is_pangram(sentence: str) -> bool:
    """Checks if a sentence is a pangram.

    A pangram is a sentence that contains every letter of the English alphabet
    at least once. The check is case-insensitive.

    Args:
        sentence: The string to check.

    Returns:
        True if the sentence is a pangram, False otherwise.
    """
    # Check if the set of all lowercase letters is a subset of the letters
    # in the lowercased input sentence.
    return set(string.ascii_lowercase).issubset(sentence.lower())


# This block runs only when the script is executed directly
if __name__ == "__main__":
    pangram1 = "The quick brown fox jumps over the lazy dog."
    pangram2 = "Pack my box with five dozen liquor jugs."
    not_pangram1 = "Hello world"
    not_pangram2 = ""

    print(f"'{pangram1}' is a pangram: {is_pangram(pangram1)}")
    print(f"'{pangram2}' is a pangram: {is_pangram(pangram2)}")
    print(f"'{not_pangram1}' is a pangram: {is_pangram(not_pangram1)}")
    print(f"'{not_pangram2}' is a pangram: {is_pangram(not_pangram2)}")

    # --- Self-verifying tests ---
    # Using assert is a simple way to test conditions.
    # If the condition is False, it raises an AssertionError.
    # If the script runs without errors, all tests have passed.
    print("\nRunning tests...")
    assert is_pangram("The quick brown fox jumps over the lazy dog.") is True
    assert is_pangram("Waltz, bad nymph, for quick jigs vex.") is True
    assert is_pangram("abcdefghijklmnopqrstuvwxyz") is True
    assert is_pangram("ABCDEFGHIJKLMNOPQRSTUVWXYZ") is True
    assert is_pangram("This is not a pangram.") is False
    assert is_pangram("") is False
    print("All tests passed successfully!")