#!/usr/bin/env python3
import pydicom
from pydicom.datadict import keyword_for_tag

# 1) Point this at your file
ds = pydicom.dcmread("1-01.dcm")

# 2) Iterate through all data elements
for elem in ds:
    tag_hex   = f"{elem.tag.group:04X},{elem.tag.element:04X}"
    keyword   = keyword_for_tag(elem.tag) or elem.name
    value_str = elem.value if not isinstance(elem.value, bytes) else "<binary data>"
    print(f"{tag_hex}  {keyword:25s} = {value_str}")
