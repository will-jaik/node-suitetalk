"use strict";

const BaseObject = require("../../../baseObject");

class Record extends BaseObject {

    constructor(familyType, typeName) {
        super(familyType, typeName);
        this.bodyFieldList = [];
        this.lineList = [];
        this.nullFields = undefined;
        this.customFields = undefined;
        this.externalId = undefined;
        this.internalId = undefined;
        this.isInactive = undefined;
        this._isCustomRecord = false;
    }

    _getSoapType() {
        //return "record";
        return `${this._familyType}:record`;
    }

    _getAttributes() {

        const attr = {
            "externalId": this.externalId,
            "internalId": this.internalId,
            "isInactive": this.isInactive,
            "xsi:type": `${this._familyType}:${this._typeName}`,
        };

        if (!this.externalId) {
            delete attr.externalId;
        }

        if (!this.internalId) {
            delete attr.internalId;
        }

        if (this.isInactive === undefined) {
            delete attr.isInactive;
        }

        return attr;
    }

    getNode() {

        const attributes = this._getAttributes();
        const type = this._getSoapType();

        if (!type) {
            throw new Error(`Invalid SOAP type ${type}`);
        }

        if (!this.typeId && this._isCustomRecord) {
            throw new Error("Custom record requires typeId to be set");
        }

        const node = {};

        node[type] = {};

        if (attributes) {
            node[type]["$attributes"] = attributes;
        }

        if (this.typeId) {
            node[type][`${this._familyType}:recType`] = {};
            node[type][`${this._familyType}:recType`]["$attributes"] = {
                internalId: this.typeId,
                "xsi:type": "platformCore:RecordRef",
            };
        }

        this.bodyFieldList.forEach((el) => {
            if (!el._familyType) {
                el._familyType = this._familyType;
            }
            Object.assign(node[type], el.getNode());
        });

        this.lineList.forEach((el) => {
            if (!el._familyType) {
                el._familyType = this._familyType;
            }
            Object.assign(node[type], el.getNode());
        });

        if (this.nullFieldList) {
            Object.assign(node[type], this.nullFieldList.getNode());
        }

        if (this.customFieldList) {
            if (!this.customFieldList._familyType) {
                this.customFieldList._familyType = this._familyType;
            }
            Object.assign(node[type], this.customFieldList.getNode());
        }

        return node;
    }
}

module.exports = Record;
