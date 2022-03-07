import os, json
import numpy as np

OUTPUT = 'output/'

MAX_SUPPLY = 70
NORMAL_COUNT = MAX_SUPPLY//5

def save_metadata(metadata: object, index: int):
    index_str = str(index)
    if 'Original' in metadata['name']:
        print("the original index:", index)
    else:
        metadata['name'] += index_str
    with open(OUTPUT + index_str, 'w+') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"complete #{index}", end='\r')

def main():
    with open("the-original.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata = [metadata.copy()]
    with open("the-reborns-amber.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata += [metadata.copy() for _ in range(NORMAL_COUNT-1)]
    with open("the-reborns-aqua.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata += [metadata.copy() for _ in range(NORMAL_COUNT)]
    with open("the-reborns-cobalt-blue.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata += [metadata.copy() for _ in range(NORMAL_COUNT)]
    with open("the-reborns-purple.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata += [metadata.copy() for _ in range(NORMAL_COUNT)]
    with open("the-reborns-sea-foam.json", 'r') as f:
        metadata = json.loads(f.read())
        all_metadata += [metadata.copy() for _ in range(NORMAL_COUNT)]

    print("metadata count:", len(all_metadata))
    np.random.shuffle(all_metadata)
    [ save_metadata(metadata, idx) for idx, metadata in enumerate(all_metadata) ]

    return


if __name__ == '__main__':
    main()