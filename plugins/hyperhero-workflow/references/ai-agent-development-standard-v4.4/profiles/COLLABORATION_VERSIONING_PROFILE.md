# 共同開發與版本號 Profile v4.4

`DEV-REQ-001` 為不可替代規則：

- 每次 Commit：版本號右邊 `+1`。
- PR 進入 Stage：版本號中間 `+1`，右邊清零。
- CI 必須自動驗證增量與產生證據；禁止 Builder 手動略過。
- UI 顯示的版本號與 Build Artifact 必須一致。
- 可另外保存 Commit SHA、Build ID 或相容性版本，但不得用另一套 `delivery_version/release_version` 取代來源規則。
