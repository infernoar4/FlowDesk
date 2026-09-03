package com.flowdesk.controller;

import com.flowdesk.model.AssetRequest;
import com.flowdesk.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetRepository assetRepository;

    @Autowired
    public AssetController(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<List<AssetRequest>> getAllAssets() {
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<AssetRequest> createAssetRequest(@RequestBody AssetRequest assetRequest) {
        return ResponseEntity.ok(assetRepository.save(assetRequest));
    }
}
