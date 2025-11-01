package com.example;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/board")
public class BoardController {

    private final List<Point> points = Collections.synchronizedList(new ArrayList<>());

    @PostMapping("/add")
    public void addPoint(@RequestBody Point p) {
        points.add(p);
    }

    @GetMapping("/points")
    public List<Point> getPoints() {
        return points;
    }

    @DeleteMapping("/clear")
    public void clearPoints() {
        points.clear();
    }

    static class Point {
        public float x;
        public float y;
        public String color;
    }
}
