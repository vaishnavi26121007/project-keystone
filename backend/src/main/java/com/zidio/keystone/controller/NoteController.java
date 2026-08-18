package com.zidio.keystone.controller;

import com.zidio.keystone.entity.WorkOrderNote;
import com.zidio.keystone.repository.WorkOrderNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class NoteController {

    private final WorkOrderNoteRepository noteRepository;

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<WorkOrderNote>> getNotes(@PathVariable Long id) {
        return ResponseEntity.ok(noteRepository.findByWorkOrderIdOrderByCreatedAtAsc(id));
    }
}
