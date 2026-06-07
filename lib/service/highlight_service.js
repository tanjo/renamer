const DiffRepository = require("../repository/diff_repository");

class HighlightService {

  constructor() {
    this.diffRepository = new DiffRepository();
  }

  removeOnly(original, modified) {
    return this.diffRepository.highlight(original, modified, { isRemoveOnly: true });
  }

  addOnly(original, modified) {
    return this.diffRepository.highlight(original, modified, { isAddOnly: true });
  }

};
module.exports = HighlightService;