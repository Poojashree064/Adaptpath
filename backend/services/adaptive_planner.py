def generate_learning_path(weak_topics, interference_map):
    final_path = []

    for topic in weak_topics:
        final_path.append(topic)

        if topic in interference_map:
            final_path.append("Revision Buffer")

    return final_path
