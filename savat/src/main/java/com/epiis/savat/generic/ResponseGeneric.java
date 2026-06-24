package com.epiis.savat.generic;

import java.util.ArrayList;
import java.util.List;

public class ResponseGeneric {

    public String type = "error";
    public List<String> listMessage = new ArrayList<>();

    public void success() {
        this.type = "success";
    }
}
