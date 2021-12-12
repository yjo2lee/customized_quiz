import json
import re

with open("iot_data (4).json") as f:
    data = json.load(f)

ai_data = {}
l = len(data)
for i in range(l):
    q = data[str(i)]['Question']
    q = q.replace(" the answer is the same.", "")
    # print("Original:\t", q)

    
    if "hint" not in q and "Statement" not in q:
        fq = q
    else:
        if "Statement" not in q:
            hl = [m.start() for m in re.finditer('hint', q)]
            h_string = []
            for j, h_s in enumerate(hl):
                if j == len(hl)-1:
                    h_e = len(q)
                else:
                    h_e = hl[j+1]
                h_string.append(q[h_s+6: h_e].strip())
            s = h_string[-1]
            h_string = h_string[:-1]
        else:
            at = []
            hl = [(m.start(), 6) for m in re.finditer('hint', q)]
            hl.append((q.index("Statement"), 11))
            hl.sort(key=lambda x:x[0])

            h_string = []
            for j, (h_s, sl) in enumerate(hl):
                if j == len(hl)-1:
                    h_e = len(q)
                else:
                    h_e = hl[j+1][0]
                if sl == 6:
                    h_string.append(q[h_s+6: h_e].strip())
                elif sl == 11:
                    s = q[h_s+10: h_e].strip()
        fq = s
        if len(h_string) > 0:
            fq += " (hint: "
            for h in h_string:
                fq += h + ", "
            fq = fq[:-2]
            fq += ")"
    info = {}
    info["Question"] = fq
    info["Answer"] = data[str(i)]['Answer']
    info["Type"] = data[str(i)]['Type']
    info["Level"] = data[str(i)]['Level']
    ai_data[str(i)] = info
with open("iot_data_new.json", "w") as json_file:
    json.dump(ai_data, json_file)

    # print("New:\t\t", fq)
    # input()


    # data[str(i)]['Question'] = q