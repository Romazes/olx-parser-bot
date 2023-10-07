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

  async getAll() {
    try {
      const items = await this.model.find();

      return { error: false, statusCode: 200, data: items };
    } catch (errors) {
      throw errors;
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
      // TODO: What should I do with duplicate keys ?
      if (error.code == 11000) return { error: false, statusCode: 409 };

      return { error: true, statusCode: 400, error };
    }
  }
}

export default Service;
