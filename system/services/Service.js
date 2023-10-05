import autoBind from "auto-bind";

class Service {
  constructor(model) {
    this.model = model;
    autoBind(this);
  }

  async get(id) {
    try {
      const item = await this.model.findById(id);

      if (!item) {
        const error = new Error("Item not found");
        error.statusCode = 404;
        throw error;
      }

      return { error: false, statusCode: 200, data: item };
    } catch (errors) {
      return { error: true, statusCode: errors.statusCode, errors };
    }
  }

  async insert(data) {
    try {
      let item = await this.model.create(data);
      if (item) {
        return { error: false, item };
      }
      throw new Error("Something wrong happened");
    } catch (error) {
      return { error: true, statusCode: 400, error };
    }
  }
}

export default Service;