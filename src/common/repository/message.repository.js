import { MessageModel } from '../../DB/model/message.model.js';
import * as base from './base.repository.js'
export const findById = async ({ id, options, select }) => {
 
  return await base.findById({model:MessageModel,options,id,select})
};

export const findOne = async ({ filter, options, select } = {}) => {

  return await base.findOne({model:MessageModel,options,filter,select})
};

export const find = async ({ filter, options, select,  } = {}) => {

  return await base.find({model:MessageModel,options,filter})
};
export const paginate = async ({
  filter = {},
  options = {},
  select,
  page = "all",
  size = 5,
  sort,
} = {}) => {
 
  return await base.paginate({model:MessageModel,options,filter,select,page,size,sort})

};

export const create = async ({ data, options }) => {
  return await base.create({model:MessageModel,options,data})
};

export const insertMany = async ({ data }) => {
  return await base.insertMany({model:MessageModel,data})
  
};

export const updateOne = async ({ filter, update, options } = {}) => {
  return await base.updateOne({model:MessageModel,options,filter})
  
};

export const findOneAndUpdate = async ({
  filter,
  update,
  options,
} = {}) => {
 
  
  return await base.findOneAndUpdate({model:MessageModel,options,filter,update})

};

export const findByIdAndUpdate = async ({
  id,
  update,
  options = { new: true },
  
}) => {
  return await base.findByIdAndUpdate({model:MessageModel,update,options,id})
 
};

export const deleteOne = async ({ filter }) => {
  return await base.deleteOne({model:MessageModel,filter})

};

export const deleteMany = async ({ filter }) => {
  return await base.deleteMany({model:MessageModel,filter})
  
};

export const findOneAndDelete = async ({ filter } = {}) => {
   return await base.findOneAndDelete({model:MessageModel,filter})

};

