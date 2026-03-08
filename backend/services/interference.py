def detect_interference(history):
    interference_map = {}

    for i in range(1, len(history)):
        prev = history[i - 1]
        curr = history[i]

        if prev["topic"] != curr["topic"]:
            if prev["accuracy_after"] < prev["accuracy_before"] - 20:
                interference_map.setdefault(prev["topic"], []).append(curr["topic"])

    return interference_map
